import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { GramPanchayat } from './entities/gram-panchayat.entity';
import { CreateGramPanchayatDto } from './dto/create-gram-panchayat.dto';
import { UpdateGramPanchayatDto } from './dto/update-gram-panchayat.dto';
import { IdSequenceService } from '../codes/id-sequence.service';
import { DistrictCodeService } from '../codes/district-code.service';
import { getStateCode } from '../codes/code-generator.util';

@Injectable()
export class GramPanchayatService {
  constructor(
    @InjectRepository(GramPanchayat)
    private gpRepo: Repository<GramPanchayat>,
    private idSequenceService: IdSequenceService,
    private districtCodeService: DistrictCodeService,
  ) {}

  /** Generate the next display code, e.g. GP-JH-RAN-1 */
  private async generateGpCode(state: string, district: string): Promise<string> {
    const stateCode = getStateCode(state);
    const districtCode = await this.districtCodeService.getCode(state, district);
    const seq = await this.idSequenceService.next('GP');
    return `GP-${stateCode}-${districtCode}-${seq}`;
  }

  async create(dto: CreateGramPanchayatDto): Promise<GramPanchayat> {
    const existing = await this.gpRepo.findOne({
      where: { lgdCode: dto.lgdCode },
    });
    if (existing) {
      throw new ConflictException(
        `Gram Panchayat with LGD code ${dto.lgdCode} already exists`,
      );
    }
    const gpCode = await this.generateGpCode(dto.state, dto.district);
    return this.gpRepo.save(this.gpRepo.create({ ...dto, gpCode }));
  }

  findAll(query?: { district?: string; state?: string }): Promise<GramPanchayat[]> {
    const where: Record<string, any> = {};
    if (query?.district) where.district = query.district;
    if (query?.state) where.state = query.state;
    return this.gpRepo.find({ where, order: { gpName: 'ASC' } });
  }

  search(q: string): Promise<GramPanchayat[]> {
    return this.gpRepo.find({
      where: [{ gpName: ILike(`%${q}%`) }, { lgdCode: ILike(`%${q}%`) }],
      order: { gpName: 'ASC' },
      take: 20,
    });
  }

  async findOne(id: string): Promise<GramPanchayat> {
    const gp = await this.gpRepo.findOne({
      where: { id },
      relations: ['farmers'],
    });
    if (!gp) throw new NotFoundException(`Gram Panchayat #${id} not found`);
    return gp;
  }

  async update(id: string, dto: UpdateGramPanchayatDto): Promise<GramPanchayat> {
    const gp = await this.findOne(id);
    Object.assign(gp, dto);
    return this.gpRepo.save(gp);
  }

  count(): Promise<number> {
    return this.gpRepo.count();
  }
}
