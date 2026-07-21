import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Calculation } from './entities/calculation.entity';
import { Instance } from '../instances/entities/instance.entity';
import { MonitoringPeriod } from '../monitoring/entities/monitoring-period.entity';

const CO2_TO_C_RATIO = 44 / 12;

@Injectable()
export class CalculationsService {
  constructor(
    @InjectRepository(Calculation)
    private calculationsRepo: Repository<Calculation>,
    @InjectRepository(Instance)
    private instancesRepo: Repository<Instance>,
    @InjectRepository(MonitoringPeriod)
    private monitoringRepo: Repository<MonitoringPeriod>,
  ) {}

  async run(instanceId: string, periodId: string): Promise<Calculation> {
    const instance = await this.instancesRepo.findOne({
      where: { id: instanceId },
      relations: ['plantingUnits', 'plantingUnits.species'],
    });
    if (!instance) throw new NotFoundException(`Instance #${instanceId} not found`);

    const period = await this.monitoringRepo.findOne({ where: { id: periodId } });
    if (!period) throw new NotFoundException(`Monitoring period #${periodId} not found`);

    let agbBiomassKg = 0;
    let carbonStockKg = 0;

    for (const unit of instance.plantingUnits) {
      if (unit.lossDate || unit.dbhCm == null) continue;
      const { allometricA, allometricB, carbonFraction } = unit.species ?? {};
      if (allometricA == null || allometricB == null) continue;

      // AGB (kg) = exp(a + b * ln(DBH))
      const agb = Math.exp(Number(allometricA) + Number(allometricB) * Math.log(Number(unit.dbhCm)));
      agbBiomassKg += agb;
      carbonStockKg += agb * Number(carbonFraction ?? 0.47);
    }

    const carbonStockTonnes = carbonStockKg / 1000;
    const co2e = carbonStockTonnes * CO2_TO_C_RATIO;
    const netCredits = co2e; // No deduction data sources currently exist

    const calculation = this.calculationsRepo.create({
      instanceId,
      periodId,
      agbBiomass: agbBiomassKg,
      carbonStock: carbonStockTonnes,
      co2e,
      netCredits,
    });

    return this.calculationsRepo.save(calculation);
  }

  getByInstance(instanceId: string): Promise<Calculation[]> {
    return this.calculationsRepo.find({
      where: { instanceId },
      relations: ['period'],
      order: { createdAt: 'DESC' },
    });
  }

  async getSummary(): Promise<{
    totalNetCredits: number;
    totalCalculations: number;
    totalCo2e: number;
  }> {
    const result = await this.calculationsRepo
      .createQueryBuilder('calc')
      .select('COALESCE(SUM(calc.netCredits), 0)', 'totalNetCredits')
      .addSelect('COALESCE(SUM(calc.co2e), 0)', 'totalCo2e')
      .addSelect('COUNT(*)', 'totalCalculations')
      .getRawOne();

    return {
      totalNetCredits: parseFloat(result.totalNetCredits),
      totalCo2e: parseFloat(result.totalCo2e),
      totalCalculations: parseInt(result.totalCalculations, 10),
    };
  }

  /** Sum of net credits across all calculations (dashboard) */
  async totalNetCredits(): Promise<number> {
    const { totalNetCredits } = await this.getSummary();
    return totalNetCredits;
  }
}
