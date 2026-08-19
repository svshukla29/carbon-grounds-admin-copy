import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KyariBed } from './entities/kyari-bed.entity';
import { CreateKyariBedDto } from './dto/create-kyari-bed.dto';
import { UpdateKyariBedDto } from './dto/update-kyari-bed.dto';
import { BulkCreateKyariBedsDto } from './dto/bulk-create-kyari-beds.dto';

@Injectable()
export class KyariBedsService {
  constructor(
    @InjectRepository(KyariBed)
    private kyariBedsRepo: Repository<KyariBed>,
  ) {}

  create(dto: CreateKyariBedDto): Promise<KyariBed> {
    return this.kyariBedsRepo.save(this.kyariBedsRepo.create(dto));
  }

  bulkCreate(dto: BulkCreateKyariBedsDto): Promise<KyariBed[]> {
    const beds = dto.beds.map((bed) =>
      this.kyariBedsRepo.create({ ...bed, instanceId: dto.instanceId }),
    );
    return this.kyariBedsRepo.save(beds);
  }

  findByInstance(instanceId: string): Promise<KyariBed[]> {
    return this.kyariBedsRepo.find({
      where: { instanceId },
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<KyariBed> {
    const bed = await this.kyariBedsRepo.findOne({ where: { id } });
    if (!bed) throw new NotFoundException(`Kyari bed #${id} not found`);
    return bed;
  }

  async update(id: string, dto: UpdateKyariBedDto): Promise<KyariBed> {
    const bed = await this.findOne(id);
    Object.assign(bed, dto);
    return this.kyariBedsRepo.save(bed);
  }

  async remove(id: string): Promise<void> {
    const bed = await this.findOne(id);
    await this.kyariBedsRepo.remove(bed);
  }

  /** Total Kyari bed count across all plots (dashboard) */
  count(): Promise<number> {
    return this.kyariBedsRepo.count();
  }

  /** Sum of all Kyari bed areas (dashboard) */
  async totalAreaAcres(): Promise<number> {
    const { total } = await this.kyariBedsRepo
      .createQueryBuilder('bed')
      .select('COALESCE(SUM(bed.areaAcres), 0)', 'total')
      .getRawOne();
    return parseFloat(total);
  }
}
