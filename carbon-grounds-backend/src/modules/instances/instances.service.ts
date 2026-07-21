import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { Instance } from './entities/instance.entity';
import { Farmer } from '../farmers/entities/farmer.entity';
import { CreateInstanceDto } from './dto/create-instance.dto';
import { UpdateInstanceDto } from './dto/update-instance.dto';
import { IdSequenceService } from '../codes/id-sequence.service';
import { extractSeq } from '../codes/code-generator.util';

@Injectable()
export class InstancesService {
  constructor(
    @InjectRepository(Instance)
    private instancesRepo: Repository<Instance>,
    @InjectRepository(Farmer)
    private farmersRepo: Repository<Farmer>,
    private idSequenceService: IdSequenceService,
  ) {}

  /** Generate the next display code, e.g. INS-FR1-1 */
  private async generateInstanceCode(farmerId: string): Promise<string> {
    const farmer = await this.farmersRepo.findOne({ where: { id: farmerId } });
    const farmerSeq = farmer ? extractSeq(farmer.instanceId) : 0;
    const seq = await this.idSequenceService.next('INS');
    return `INS-FR${farmerSeq}-${seq}`;
  }

  async create(dto: CreateInstanceDto): Promise<Instance> {
    const instanceId = await this.generateInstanceCode(dto.farmerId);
    const instance = this.instancesRepo.create({ ...dto, instanceId });
    const saved = await this.instancesRepo.save(instance);
    return this.findOne(saved.id);
  }

  async findAll(query?: {
    farmerId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Instance[]; total: number }> {
    const page = query?.page && query.page > 0 ? query.page : 1;
    const limit = query?.limit && query.limit > 0 ? query.limit : 15;

    const qb = this.instancesRepo
      .createQueryBuilder('instance')
      .leftJoinAndSelect('instance.farmer', 'farmer')
      .loadRelationCountAndMap(
        'instance.totalPlantingUnits',
        'instance.plantingUnits',
      )
      .orderBy('instance.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query?.farmerId) {
      qb.andWhere('instance.farmerId = :farmerId', {
        farmerId: query.farmerId,
      });
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async findOne(id: string): Promise<Instance> {
    const instance = await this.instancesRepo.findOne({
      where: { id },
      relations: ['farmer', 'plantingUnits', 'plantingUnits.species'],
    });
    if (!instance) throw new NotFoundException(`Instance #${id} not found`);
    return instance;
  }

  async update(id: string, dto: UpdateInstanceDto): Promise<Instance> {
    const instance = await this.instancesRepo.findOne({ where: { id } });
    if (!instance) throw new NotFoundException(`Instance #${id} not found`);
    Object.assign(instance, dto);
    await this.instancesRepo.save(instance);
    return this.findOne(id);
  }

  /** GeoJSON FeatureCollection of all plots that have a boundary recorded */
  async getAllGeoJson() {
    const instances = await this.instancesRepo.find({
      where: { boundaryGeojson: Not(IsNull()) },
      relations: ['farmer'],
    });

    const features = instances
      .map((instance) => {
        const geometry = this.extractGeometry(instance.boundaryGeojson);
        if (!geometry) return null;
        return {
          type: 'Feature',
          geometry,
          properties: {
            id: instance.id,
            instanceId: instance.instanceId,
            farmerId: instance.farmerId,
            farmerName: instance.farmer?.farmerName,
            areaAcres: instance.areaAcres,
          },
        };
      })
      .filter(Boolean);

    return { type: 'FeatureCollection', features };
  }

  /** Accepts a stored Feature, FeatureCollection or raw Geometry and returns a Geometry */
  private extractGeometry(value: any): any {
    if (!value || typeof value !== 'object') return null;
    if (value.type === 'Feature') return value.geometry ?? null;
    if (value.type === 'FeatureCollection') {
      return value.features?.[0]?.geometry ?? null;
    }
    return value;
  }

  count(): Promise<number> {
    return this.instancesRepo.count();
  }
}
