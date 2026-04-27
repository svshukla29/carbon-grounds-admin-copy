import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Partner, PartnerStatus } from './entities/partner.entity';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';

@Injectable()
export class PartnersService {
  constructor(
    @InjectRepository(Partner)
    private partnersRepo: Repository<Partner>,
  ) {}

  async create(dto: CreatePartnerDto): Promise<Partner> {
    const partner = this.partnersRepo.create(dto);
    return this.partnersRepo.save(partner);
  }

  async findAll(query?: { search?: string; status?: PartnerStatus }): Promise<Partner[]> {
    const qb = this.partnersRepo.createQueryBuilder('partner').orderBy('partner.createdAt', 'DESC');
    if (query?.search) {
      qb.andWhere('(partner.name ILIKE :s OR partner.location ILIKE :s)', { s: `%${query.search}%` });
    }
    if (query?.status) {
      qb.andWhere('partner.status = :status', { status: query.status });
    }
    return qb.getMany();
  }

  async findOne(id: string): Promise<Partner> {
    const partner = await this.partnersRepo.findOne({ where: { id } });
    if (!partner) throw new NotFoundException(`Partner #${id} not found`);
    return partner;
  }

  async update(id: string, dto: UpdatePartnerDto): Promise<Partner> {
    const partner = await this.findOne(id);
    Object.assign(partner, dto);
    return this.partnersRepo.save(partner);
  }

  async remove(id: string): Promise<{ message: string }> {
    const partner = await this.findOne(id);
    await this.partnersRepo.remove(partner);
    return { message: 'Partner deleted successfully' };
  }

  async count(): Promise<number> {
    return this.partnersRepo.count();
  }
}
