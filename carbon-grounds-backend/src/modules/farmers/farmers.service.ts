import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Farmer, FarmerCategory, FarmerStatus } from './entities/farmer.entity';
import { CreateFarmerDto } from './dto/create-farmer.dto';
import { UpdateFarmerDto } from './dto/update-farmer.dto';
import { GramPanchayat } from '../gram-panchayat/entities/gram-panchayat.entity';
import { IdSequenceService } from '../codes/id-sequence.service';
import { extractSeq } from '../codes/code-generator.util';

@Injectable()
export class FarmersService {
  constructor(
    @InjectRepository(Farmer)
    private farmersRepo: Repository<Farmer>,
    @InjectRepository(GramPanchayat)
    private gpRepo: Repository<GramPanchayat>,
    private idSequenceService: IdSequenceService,
  ) {}

  /** Generate the next display code, e.g. FR-GP1-1 */
  private async generateFarmerCode(gramPanchayatId?: string): Promise<string> {
    let gpSeq = 0;
    if (gramPanchayatId) {
      const gp = await this.gpRepo.findOne({ where: { id: gramPanchayatId } });
      if (gp?.gpCode) gpSeq = extractSeq(gp.gpCode);
    }

    const farmerSeq = await this.idSequenceService.next('FR');
    return `FR-GP${gpSeq}-${farmerSeq}`;
  }

  private toResponse(farmer: Farmer) {
    return {
      ...farmer,
      isPvtg: farmer.category === FarmerCategory.ST && !!farmer.tribe?.isPvtg,
      tribeName: farmer.tribe?.name ?? null,
    };
  }

  async create(dto: CreateFarmerDto): Promise<Farmer> {
    const state = dto.state || 'Chhattisgarh';
    const instanceId = await this.generateFarmerCode(dto.gramPanchayatId);

    const farmer = this.farmersRepo.create({
      ...dto,
      state,
      instanceId,
    });
    const saved = await this.farmersRepo.save(farmer);
    return this.findOne(saved.id);
  }

  async findAll(query?: {
    page?: number;
    limit?: number;
    category?: string;
    state?: string;
  }): Promise<{ data: any[]; total: number }> {
    const page = query?.page && query.page > 0 ? query.page : 1;
    const limit = query?.limit && query.limit > 0 ? query.limit : 15;

    const qb = this.farmersRepo
      .createQueryBuilder('farmer')
      .leftJoinAndSelect('farmer.tribe', 'tribe')
      .leftJoinAndSelect('farmer.gramPanchayat', 'gramPanchayat')
      .orderBy('farmer.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query?.category && query.category !== 'all') {
      qb.andWhere('farmer.category = :category', { category: query.category });
    }
    if (query?.state && query.state !== 'all') {
      qb.andWhere('farmer.state = :state', { state: query.state });
    }

    const [farmers, total] = await qb.getManyAndCount();
    return { data: farmers.map((f) => this.toResponse(f)), total };
  }

  async search(q: string): Promise<any[]> {
    const farmers = await this.farmersRepo.find({
      where: [
        { farmerName: ILike(`%${q}%`) },
        { instanceId: ILike(`%${q}%`) },
        { mobileNo: ILike(`%${q}%`) },
        { villageName: ILike(`%${q}%`) },
      ],
      relations: ['tribe', 'gramPanchayat'],
      order: { createdAt: 'DESC' },
      take: 20,
    });
    return farmers.map((f) => this.toResponse(f));
  }

  async findOne(id: string): Promise<any> {
    const farmer = await this.farmersRepo.findOne({
      where: { id },
      relations: ['tribe', 'gramPanchayat'],
    });
    if (!farmer) throw new NotFoundException(`Farmer #${id} not found`);
    return this.toResponse(farmer);
  }

  async update(id: string, dto: UpdateFarmerDto): Promise<any> {
    const farmer = await this.farmersRepo.findOne({ where: { id } });
    if (!farmer) throw new NotFoundException(`Farmer #${id} not found`);
    Object.assign(farmer, dto);
    await this.farmersRepo.save(farmer);
    return this.findOne(id);
  }

  async remove(id: string): Promise<{ message: string }> {
    const farmer = await this.farmersRepo.findOne({ where: { id } });
    if (!farmer) throw new NotFoundException(`Farmer #${id} not found`);
    await this.farmersRepo.remove(farmer);
    return { message: 'Farmer deleted successfully' };
  }

  /** Total farmer count (dashboard) */
  count(): Promise<number> {
    return this.farmersRepo.count();
  }

  /**
   * Mobile numbers aren't DB-unique (existing data has duplicates from shared
   * household phones) — resolve ties by taking the most recently created match.
   */
  findByMobile(mobileNo: string): Promise<Farmer | null> {
    return this.farmersRepo.findOne({
      where: { mobileNo },
      order: { createdAt: 'DESC' },
    });
  }

  /** Used by JWT strategies — returns null instead of throwing when not found. */
  findByIdOrNull(id: string): Promise<Farmer | null> {
    return this.farmersRepo.findOne({
      where: { id },
      relations: ['tribe', 'gramPanchayat'],
    });
  }

  /** Minimal self-service registration — record starts PENDING until field staff verify it. */
  async createFromSignup(mobileNo: string, farmerName: string, villageName: string): Promise<Farmer> {
    const instanceId = await this.generateFarmerCode();
    const farmer = this.farmersRepo.create({
      farmerName,
      mobileNo,
      villageName,
      status: FarmerStatus.PENDING,
      instanceId,
    });
    return this.farmersRepo.save(farmer);
  }
}
