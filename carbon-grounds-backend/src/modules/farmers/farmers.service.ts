import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Farmer, FarmerStatus } from './entities/farmer.entity';
import { CreateFarmerDto } from './dto/create-farmer.dto';
import { UpdateFarmerDto } from './dto/update-farmer.dto';

@Injectable()
export class FarmersService {
  constructor(
    @InjectRepository(Farmer)
    private farmersRepo: Repository<Farmer>,
  ) {}

  async create(dto: CreateFarmerDto): Promise<Farmer> {
    const farmer = this.farmersRepo.create(dto);
    return this.farmersRepo.save(farmer);
  }

  async findAll(query?: {
    search?: string;
    status?: FarmerStatus;
    location?: string;
  }): Promise<Farmer[]> {
    const where: FindOptionsWhere<Farmer> = {};

    if (query?.status) where.status = query.status;

    if (query?.search || query?.location) {
      const qb = this.farmersRepo.createQueryBuilder('farmer');

      if (query.search) {
        qb.andWhere(
          '(farmer.name ILIKE :search OR farmer.location ILIKE :search)',
          { search: `%${query.search}%` },
        );
      }
      if (query.status) {
        qb.andWhere('farmer.status = :status', { status: query.status });
      }
      if (query.location) {
        qb.andWhere('farmer.location ILIKE :loc', {
          loc: `%${query.location}%`,
        });
      }
      return qb.orderBy('farmer.createdAt', 'DESC').getMany();
    }

    return this.farmersRepo.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Farmer> {
    const farmer = await this.farmersRepo.findOne({
      where: { id },
      relations: ['projects'],
    });
    if (!farmer) throw new NotFoundException(`Farmer #${id} not found`);
    return farmer;
  }

  async update(id: string, dto: UpdateFarmerDto): Promise<Farmer> {
    const farmer = await this.findOne(id);
    Object.assign(farmer, dto);
    return this.farmersRepo.save(farmer);
  }

  async remove(id: string): Promise<{ message: string }> {
    const farmer = await this.findOne(id);
    await this.farmersRepo.remove(farmer);
    return { message: `Farmer deleted successfully` };
  }

  /** Total farmer count */
  async count(): Promise<number> {
    return this.farmersRepo.count();
  }

  /** Count of farmers with Verified status (shown as "Active Farmers" in dashboard) */
  async countActive(): Promise<number> {
    return this.farmersRepo.count({ where: { status: FarmerStatus.VERIFIED } });
  }
}
