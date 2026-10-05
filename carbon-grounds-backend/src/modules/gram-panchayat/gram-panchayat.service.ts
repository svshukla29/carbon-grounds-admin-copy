import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { GramPanchayat } from './entities/gram-panchayat.entity';
import { Instance } from '../instances/entities/instance.entity';
import { PlantingUnit } from '../planting-units/entities/planting-unit.entity';
import { Calculation } from '../calculations/entities/calculation.entity';
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
    @InjectRepository(Instance)
    private instancesRepo: Repository<Instance>,
    @InjectRepository(PlantingUnit)
    private plantingUnitsRepo: Repository<PlantingUnit>,
    @InjectRepository(Calculation)
    private calculationsRepo: Repository<Calculation>,
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

  /**
   * Aggregates plots, trees, area and carbon credits across every farmer
   * registered under this Gram Panchayat — for the "Panchayat-wise data"
   * summary view.
   */
  async getSummary(id: string): Promise<{
    farmerCount: number;
    totalPlots: number;
    totalAreaAcres: number;
    totalTrees: number;
    totalNetCredits: number;
    verifiedNetCredits: number;
    pendingNetCredits: number;
  }> {
    const gp = await this.findOne(id);
    const farmerIds = gp.farmers.map((f) => f.id);

    if (farmerIds.length === 0) {
      return {
        farmerCount: 0,
        totalPlots: 0,
        totalAreaAcres: 0,
        totalTrees: 0,
        totalNetCredits: 0,
        verifiedNetCredits: 0,
        pendingNetCredits: 0,
      };
    }

    const instances = await this.instancesRepo.find({
      where: farmerIds.map((farmerId) => ({ farmerId })),
    });
    const instanceIds = instances.map((i) => i.id);
    const totalAreaAcres = instances.reduce((sum, i) => sum + Number(i.areaAcres || 0), 0);

    let totalTrees = 0;
    let totalNetCredits = 0;
    let verifiedNetCredits = 0;
    let pendingNetCredits = 0;

    if (instanceIds.length > 0) {
      totalTrees = await this.plantingUnitsRepo
        .createQueryBuilder('unit')
        .where('unit.instanceId IN (:...instanceIds)', { instanceIds })
        .andWhere('unit.lossDate IS NULL')
        .getCount();

      const byStatus = await this.calculationsRepo
        .createQueryBuilder('calc')
        .innerJoin('calc.period', 'period')
        .where('calc.instanceId IN (:...instanceIds)', { instanceIds })
        .andWhere('calc.retiredAt IS NULL')
        .select('period.status', 'status')
        .addSelect('COALESCE(SUM(calc.netCredits), 0)', 'netCredits')
        .groupBy('period.status')
        .getRawMany();

      verifiedNetCredits = byStatus
        .filter((r) => r.status === 'APPROVED')
        .reduce((sum, r) => sum + parseFloat(r.netCredits), 0);
      pendingNetCredits = byStatus
        .filter((r) => r.status !== 'APPROVED')
        .reduce((sum, r) => sum + parseFloat(r.netCredits), 0);
      totalNetCredits = verifiedNetCredits + pendingNetCredits;
    }

    return {
      farmerCount: farmerIds.length,
      totalPlots: instances.length,
      totalAreaAcres,
      totalTrees,
      totalNetCredits,
      verifiedNetCredits,
      pendingNetCredits,
    };
  }

  /**
   * Per-plot breakdown backing the Gram-Panchayat-wise Excel report — same
   * underlying data as getSummary(), but one row per plot instead of a
   * single rolled-up total.
   */
  async getReportData(id: string): Promise<{
    gp: GramPanchayat;
    summary: Awaited<ReturnType<GramPanchayatService['getSummary']>>;
    plots: {
      instanceId: string;
      plotName: string;
      farmerName: string;
      farmerCode: string;
      villageName: string;
      areaAcres: number;
      treeCount: number;
      verifiedNetCredits: number;
      pendingNetCredits: number;
    }[];
  }> {
    const gp = await this.findOne(id);
    const summary = await this.getSummary(id);
    const farmerIds = gp.farmers.map((f) => f.id);

    if (farmerIds.length === 0) {
      return { gp, summary, plots: [] };
    }

    const instances = await this.instancesRepo.find({
      where: farmerIds.map((farmerId) => ({ farmerId })),
      relations: ['farmer'],
    });

    const plots = await Promise.all(
      instances.map(async (instance) => {
        const treeCount = await this.plantingUnitsRepo.count({
          where: { instanceId: instance.id, lossDate: null as any },
        });

        const byStatus = await this.calculationsRepo
          .createQueryBuilder('calc')
          .innerJoin('calc.period', 'period')
          .where('calc.instanceId = :instanceId', { instanceId: instance.id })
          .andWhere('calc.retiredAt IS NULL')
          .select('period.status', 'status')
          .addSelect('COALESCE(SUM(calc.netCredits), 0)', 'netCredits')
          .groupBy('period.status')
          .getRawMany();

        const verifiedNetCredits = byStatus
          .filter((r) => r.status === 'APPROVED')
          .reduce((sum, r) => sum + parseFloat(r.netCredits), 0);
        const pendingNetCredits = byStatus
          .filter((r) => r.status !== 'APPROVED')
          .reduce((sum, r) => sum + parseFloat(r.netCredits), 0);

        return {
          instanceId: instance.instanceId,
          plotName: instance.plotName || '',
          farmerName: instance.farmer?.farmerName || '',
          farmerCode: instance.farmer?.instanceId || '',
          villageName: instance.farmer?.villageName || '',
          areaAcres: Number(instance.areaAcres || 0),
          treeCount,
          verifiedNetCredits,
          pendingNetCredits,
        };
      }),
    );

    return { gp, summary, plots };
  }
}
