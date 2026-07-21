import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlantingUnit } from './entities/planting-unit.entity';
import { Instance } from '../instances/entities/instance.entity';
import { CreatePlantingUnitDto } from './dto/create-planting-unit.dto';
import { UpdatePlantingUnitDto } from './dto/update-planting-unit.dto';
import { BulkCreatePlantingUnitsDto } from './dto/bulk-create-planting-units.dto';
import { MarkLossDto } from './dto/mark-loss.dto';
import { IdSequenceService } from '../codes/id-sequence.service';
import { extractSeq } from '../codes/code-generator.util';

@Injectable()
export class PlantingUnitsService {
  constructor(
    @InjectRepository(PlantingUnit)
    private plantingUnitsRepo: Repository<PlantingUnit>,
    @InjectRepository(Instance)
    private instancesRepo: Repository<Instance>,
    private idSequenceService: IdSequenceService,
  ) {}

  private async findInstanceOrThrow(instanceId: string): Promise<Instance> {
    const instance = await this.instancesRepo.findOne({ where: { id: instanceId } });
    if (!instance) throw new NotFoundException(`Instance #${instanceId} not found`);
    return instance;
  }

  async create(dto: CreatePlantingUnitDto): Promise<PlantingUnit> {
    const instance = await this.findInstanceOrThrow(dto.instanceId);
    const instanceSeq = extractSeq(instance.instanceId);
    const seq = await this.idSequenceService.next(`TR:${instance.id}`);
    const treeId = `TR-INS${instanceSeq}-${seq}`;
    return this.plantingUnitsRepo.save(this.plantingUnitsRepo.create({ ...dto, treeId }));
  }

  async bulkCreate(dto: BulkCreatePlantingUnitsDto): Promise<PlantingUnit[]> {
    const instance = await this.findInstanceOrThrow(dto.instanceId);
    const instanceSeq = extractSeq(instance.instanceId);
    const count = dto.units.length;
    const lastSeq = await this.idSequenceService.nextBatch(`TR:${instance.id}`, count);
    const startSeq = lastSeq - count + 1;

    const units = dto.units.map((unit, idx) =>
      this.plantingUnitsRepo.create({
        ...unit,
        instanceId: dto.instanceId,
        treeId: `TR-INS${instanceSeq}-${startSeq + idx}`,
      }),
    );
    return this.plantingUnitsRepo.save(units);
  }

  findByInstance(instanceId: string): Promise<PlantingUnit[]> {
    return this.plantingUnitsRepo.find({
      where: { instanceId },
      relations: ['species'],
      order: { createdAt: 'DESC' },
    });
  }

  /** Tree records joined with plot, farmer and gram panchayat details for export */
  exportTrees(filters?: { species?: string; instanceId?: string }): Promise<PlantingUnit[]> {
    const qb = this.plantingUnitsRepo
      .createQueryBuilder('unit')
      .leftJoinAndSelect('unit.species', 'species')
      .leftJoinAndSelect('unit.instance', 'instance')
      .leftJoinAndSelect('instance.farmer', 'farmer')
      .leftJoinAndSelect('farmer.gramPanchayat', 'gramPanchayat')
      .orderBy('unit.treeId', 'ASC');

    if (filters?.species) {
      qb.andWhere('species.commonName ILIKE :species', { species: `%${filters.species}%` });
    }
    if (filters?.instanceId) {
      qb.andWhere('unit.instanceId = :instanceId', { instanceId: filters.instanceId });
    }

    return qb.getMany();
  }

  async findOne(id: string): Promise<PlantingUnit> {
    const unit = await this.plantingUnitsRepo.findOne({
      where: { id },
      relations: ['species', 'instance'],
    });
    if (!unit) throw new NotFoundException(`Planting unit #${id} not found`);
    return unit;
  }

  async update(id: string, dto: UpdatePlantingUnitDto): Promise<PlantingUnit> {
    const unit = await this.plantingUnitsRepo.findOne({ where: { id } });
    if (!unit) throw new NotFoundException(`Planting unit #${id} not found`);
    Object.assign(unit, dto);
    await this.plantingUnitsRepo.save(unit);
    return this.findOne(id);
  }

  async markLoss(id: string, dto: MarkLossDto): Promise<PlantingUnit> {
    const unit = await this.plantingUnitsRepo.findOne({ where: { id } });
    if (!unit) throw new NotFoundException(`Planting unit #${id} not found`);
    unit.lossDate = new Date(dto.lossDate);
    await this.plantingUnitsRepo.save(unit);
    return this.findOne(id);
  }

  async restoreAlive(id: string): Promise<PlantingUnit> {
    const unit = await this.plantingUnitsRepo.findOne({ where: { id } });
    if (!unit) throw new NotFoundException(`Planting unit #${id} not found`);
    unit.lossDate = null;
    await this.plantingUnitsRepo.save(unit);
    return this.findOne(id);
  }

  /** Total tree count across all plots (dashboard) */
  count(): Promise<number> {
    return this.plantingUnitsRepo.count();
  }
}
