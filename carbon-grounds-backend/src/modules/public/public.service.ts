import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Farmer } from '../farmers/entities/farmer.entity';
import { Instance } from '../instances/entities/instance.entity';
import { PlantingUnit, PlantingUnitStatus } from '../planting-units/entities/planting-unit.entity';
import { GramPanchayat } from '../gram-panchayat/entities/gram-panchayat.entity';
import { Calculation } from '../calculations/entities/calculation.entity';

/**
 * Aggregate, PII-free numbers for the public-facing summary page. No farmer
 * names/contacts, no exact per-tree/per-plot GPS — counts and sums only.
 */
@Injectable()
export class PublicService {
  constructor(
    @InjectRepository(Farmer) private farmersRepo: Repository<Farmer>,
    @InjectRepository(Instance) private instancesRepo: Repository<Instance>,
    @InjectRepository(PlantingUnit) private plantingUnitsRepo: Repository<PlantingUnit>,
    @InjectRepository(GramPanchayat) private gramPanchayatsRepo: Repository<GramPanchayat>,
    @InjectRepository(Calculation) private calculationsRepo: Repository<Calculation>,
  ) {}

  async getSummary(): Promise<{
    totalFarmers: number;
    totalPlots: number;
    totalTrees: number;
    totalGramPanchayats: number;
    statesCovered: number;
    totalAreaAcres: number;
    verifiedNetCredits: number;
  }> {
    const [totalFarmers, totalPlots, totalGramPanchayats, livingTrees, areaResult, statesResult, creditsResult] =
      await Promise.all([
        this.farmersRepo.count(),
        this.instancesRepo.count(),
        this.gramPanchayatsRepo.count(),
        this.plantingUnitsRepo.count({ where: { status: PlantingUnitStatus.ALIVE } }),
        this.instancesRepo
          .createQueryBuilder('instance')
          .select('COALESCE(SUM(instance.areaAcres), 0)', 'total')
          .getRawOne(),
        this.farmersRepo
          .createQueryBuilder('farmer')
          .select('COUNT(DISTINCT farmer.state)', 'count')
          .where('farmer.state IS NOT NULL')
          .getRawOne(),
        this.calculationsRepo
          .createQueryBuilder('calc')
          .innerJoin('calc.period', 'period')
          .where('period.status = :status', { status: 'APPROVED' })
          .andWhere('calc.retiredAt IS NULL')
          .select('COALESCE(SUM(calc.netCredits), 0)', 'total')
          .getRawOne(),
      ]);

    return {
      totalFarmers,
      totalPlots,
      totalTrees: livingTrees,
      totalGramPanchayats,
      statesCovered: parseInt(statesResult.count, 10) || 0,
      totalAreaAcres: parseFloat(areaResult.total),
      verifiedNetCredits: parseFloat(creditsResult.total),
    };
  }
}
