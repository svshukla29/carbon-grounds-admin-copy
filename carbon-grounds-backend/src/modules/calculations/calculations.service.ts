import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Calculation } from './entities/calculation.entity';
import { CalculationDetail } from './entities/calculation-detail.entity';
import { Instance } from '../instances/entities/instance.entity';
import { MonitoringPeriod } from '../monitoring/entities/monitoring-period.entity';
import { IpccConstant } from '../masters/entities/ipcc-constant.entity';

const FORMULA_VERSION = 'v2-dbh-allometric-agb-zone-rsr';
const FALLBACK_CO2_TO_C_RATIO = 44 / 12;
const FALLBACK_ROOT_SHOOT_RATIO = 0.24;

export interface CalculationDetailRow {
  plantingUnitId: string;
  treeIdUsed: string;
  speciesNameUsed: string;
  dbhCmUsed: number;
  allometricAUsed: number;
  allometricBUsed: number;
  carbonFractionUsed: number;
  agbBiomassKg: number;
  carbonStockKg: number;
  formula: string;
}

@Injectable()
export class CalculationsService {
  constructor(
    @InjectRepository(Calculation)
    private calculationsRepo: Repository<Calculation>,
    @InjectRepository(CalculationDetail)
    private calculationDetailsRepo: Repository<CalculationDetail>,
    @InjectRepository(Instance)
    private instancesRepo: Repository<Instance>,
    @InjectRepository(MonitoringPeriod)
    private monitoringRepo: Repository<MonitoringPeriod>,
    @InjectRepository(IpccConstant)
    private ipccRepo: Repository<IpccConstant>,
  ) {}

  /**
   * Pure computation shared by preview() and run() — walks every living,
   * measured tree on the instance and returns the aggregate result plus a
   * per-tree breakdown with a plain-language formula string. Never touches
   * the database, so it's safe to call before a user has committed to
   * actually running/saving the calculation.
   */
  private async computeCalculation(instanceId: string): Promise<{
    instance: Instance;
    agbBiomassKg: number;
    carbonStockTonnes: number;
    co2e: number;
    netCredits: number;
    co2ToCRatio: number;
    zone: Instance['ecologicalZoneRef'];
    rootShootRatio: number;
    details: CalculationDetailRow[];
  }> {
    const instance = await this.instancesRepo.findOne({
      where: { id: instanceId },
      relations: ['plantingUnits', 'plantingUnits.species', 'ecologicalZoneRef'],
    });
    if (!instance) throw new NotFoundException(`Instance #${instanceId} not found`);

    const co2ToCRatio = await this.getConstant('CO2_TO_C_RATIO', FALLBACK_CO2_TO_C_RATIO);
    const fallbackRootShootRatio = await this.getConstant(
      'ROOT_SHOOT_RATIO_DEFAULT',
      FALLBACK_ROOT_SHOOT_RATIO,
    );

    const zone = instance.ecologicalZoneRef;
    const rootShootRatio = zone ? Number(zone.rootShootRatio) : fallbackRootShootRatio;

    let agbBiomassKg = 0;
    let carbonStockKg = 0;
    const details: CalculationDetailRow[] = [];

    for (const unit of instance.plantingUnits) {
      if (unit.lossDate || unit.dbhCm == null) continue;
      const { allometricA, allometricB, carbonFraction } = unit.species ?? {};
      if (allometricA == null || allometricB == null) continue;

      // AGB (kg) = exp(a + b * ln(DBH))
      const agb = Math.exp(Number(allometricA) + Number(allometricB) * Math.log(Number(unit.dbhCm)));
      // Below-ground biomass is added via the zone's root:shoot ratio before
      // converting to carbon, rather than as a multiplier on the final
      // number — this keeps it additive to (not double-counting) the
      // species-driven wood-density term already baked into allometricA/B.
      const cf = Number(carbonFraction ?? 0.47);
      const totalBiomass = agb * (1 + rootShootRatio);
      const treeCarbonStockKg = totalBiomass * cf;

      agbBiomassKg += agb;
      carbonStockKg += treeCarbonStockKg;

      details.push({
        plantingUnitId: unit.id,
        treeIdUsed: unit.treeId,
        speciesNameUsed: unit.species?.commonName ?? 'Unknown',
        dbhCmUsed: Number(unit.dbhCm),
        allometricAUsed: Number(allometricA),
        allometricBUsed: Number(allometricB),
        carbonFractionUsed: cf,
        agbBiomassKg: agb,
        carbonStockKg: treeCarbonStockKg,
        formula:
          `AGB = exp(${Number(allometricA).toFixed(4)} + ${Number(allometricB).toFixed(4)} × ln(${Number(unit.dbhCm).toFixed(2)})) ` +
          `= ${agb.toFixed(3)} kg; ` +
          `Carbon = AGB × (1 + R) × CF = ${agb.toFixed(3)} × (1 + ${rootShootRatio.toFixed(2)}) × ${cf.toFixed(2)} ` +
          `= ${treeCarbonStockKg.toFixed(3)} kg`,
      });
    }

    const carbonStockTonnes = carbonStockKg / 1000;
    const co2e = carbonStockTonnes * co2ToCRatio;
    const netCredits = co2e; // No deduction data sources currently exist

    return { instance, agbBiomassKg, carbonStockTonnes, co2e, netCredits, co2ToCRatio, zone, rootShootRatio, details };
  }

  /**
   * Read-only preview of what run() would produce — same inputs, formula
   * and result, but nothing is saved. This is what the "review before you
   * run it" step in the dashboard calls.
   */
  async preview(instanceId: string): Promise<{
    agbBiomass: number;
    carbonStock: number;
    co2e: number;
    netCredits: number;
    co2ToCRatio: number;
    ecologicalZoneName: string | null;
    rootShootRatio: number;
    treeCount: number;
    details: CalculationDetailRow[];
  }> {
    const result = await this.computeCalculation(instanceId);
    return {
      agbBiomass: result.agbBiomassKg,
      carbonStock: result.carbonStockTonnes,
      co2e: result.co2e,
      netCredits: result.netCredits,
      co2ToCRatio: result.co2ToCRatio,
      ecologicalZoneName: result.zone?.name ?? null,
      rootShootRatio: result.rootShootRatio,
      treeCount: result.details.length,
      details: result.details,
    };
  }

  async run(instanceId: string, periodId: string): Promise<Calculation> {
    const period = await this.monitoringRepo.findOne({ where: { id: periodId } });
    if (!period) throw new NotFoundException(`Monitoring period #${periodId} not found`);

    const result = await this.computeCalculation(instanceId);

    const calculation = await this.calculationsRepo.save(
      this.calculationsRepo.create({
        instanceId,
        periodId,
        agbBiomass: result.agbBiomassKg,
        carbonStock: result.carbonStockTonnes,
        co2e: result.co2e,
        netCredits: result.netCredits,
        formulaVersion: FORMULA_VERSION,
        ecologicalZoneId: result.zone?.id ?? null,
        ecologicalZoneNameUsed: result.zone?.name ?? null,
        rootShootRatioUsed: result.rootShootRatio,
      }),
    );

    if (result.details.length > 0) {
      await this.calculationDetailsRepo.save(
        result.details.map((row) =>
          this.calculationDetailsRepo.create({
            calculationId: calculation.id,
            plantingUnitId: row.plantingUnitId,
            treeIdUsed: row.treeIdUsed,
            speciesNameUsed: row.speciesNameUsed,
            dbhCmUsed: row.dbhCmUsed,
            allometricAUsed: row.allometricAUsed,
            allometricBUsed: row.allometricBUsed,
            carbonFractionUsed: row.carbonFractionUsed,
            agbBiomassKg: row.agbBiomassKg,
            carbonStockKg: row.carbonStockKg,
          }),
        ),
      );
    }

    return calculation;
  }

  private async getConstant(name: string, fallback: number): Promise<number> {
    const row = await this.ipccRepo.findOne({ where: { name } });
    return row ? Number(row.value) : fallback;
  }

  /** Per-tree breakdown for a calculation, plus a human-readable formula
   * readout per tree — the "show your work" view for calculation transparency. */
  async getDetails(id: string): Promise<{
    calculation: Calculation;
    details: (CalculationDetail & { formula: string })[];
  }> {
    const calculation = await this.calculationsRepo.findOne({ where: { id } });
    if (!calculation) throw new NotFoundException(`Calculation #${id} not found`);

    const details = await this.calculationDetailsRepo.find({
      where: { calculationId: id },
      order: { treeIdUsed: 'ASC' },
    });

    const withFormula = details.map((d) => ({
      ...d,
      formula:
        `AGB = exp(${Number(d.allometricAUsed).toFixed(4)} + ${Number(d.allometricBUsed).toFixed(4)} × ln(${Number(d.dbhCmUsed).toFixed(2)})) ` +
        `= ${Number(d.agbBiomassKg).toFixed(3)} kg; ` +
        `Carbon = AGB × (1 + R) × CF = ${Number(d.agbBiomassKg).toFixed(3)} × (1 + ${Number(calculation.rootShootRatioUsed ?? 0).toFixed(2)}) × ${Number(d.carbonFractionUsed).toFixed(2)} ` +
        `= ${Number(d.carbonStockKg).toFixed(3)} kg`,
    }));

    return { calculation, details: withFormula };
  }

  getByInstance(instanceId: string): Promise<Calculation[]> {
    return this.calculationsRepo.find({
      where: { instanceId },
      relations: ['period'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Marks a calculation's credits as permanently retired (used/cancelled),
   * mirroring how a real carbon registry retires issued credits so they
   * can't be resold or counted twice.
   */
  async retire(id: string, reason?: string): Promise<Calculation> {
    const calculation = await this.calculationsRepo.findOne({ where: { id } });
    if (!calculation) throw new NotFoundException(`Calculation #${id} not found`);
    calculation.retiredAt = new Date();
    calculation.retirementReason = reason ?? null;
    return this.calculationsRepo.save(calculation);
  }

  async getSummary(): Promise<{
    totalNetCredits: number;
    totalCalculations: number;
    totalCo2e: number;
    verifiedNetCredits: number;
    pendingNetCredits: number;
    retiredNetCredits: number;
  }> {
    const result = await this.calculationsRepo
      .createQueryBuilder('calc')
      .select('COALESCE(SUM(calc.netCredits), 0)', 'totalNetCredits')
      .addSelect('COALESCE(SUM(calc.co2e), 0)', 'totalCo2e')
      .addSelect('COUNT(*)', 'totalCalculations')
      .getRawOne();

    // "Verified" mirrors the monitoring-period review workflow: credits from
    // a period an admin/PM has approved. Anything not yet approved is
    // "pending". Retired credits are tracked separately regardless of
    // verification status, since only verified credits should normally be
    // retired but the field is independent.
    const byStatus = await this.calculationsRepo
      .createQueryBuilder('calc')
      .innerJoin('calc.period', 'period')
      .where('calc.retiredAt IS NULL')
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

    const retiredResult = await this.calculationsRepo
      .createQueryBuilder('calc')
      .where('calc.retiredAt IS NOT NULL')
      .select('COALESCE(SUM(calc.netCredits), 0)', 'retiredNetCredits')
      .getRawOne();

    return {
      totalNetCredits: parseFloat(result.totalNetCredits),
      totalCo2e: parseFloat(result.totalCo2e),
      totalCalculations: parseInt(result.totalCalculations, 10),
      verifiedNetCredits,
      pendingNetCredits,
      retiredNetCredits: parseFloat(retiredResult.retiredNetCredits),
    };
  }

  /** Sum of net credits across all calculations (dashboard) */
  async totalNetCredits(): Promise<number> {
    const { totalNetCredits } = await this.getSummary();
    return totalNetCredits;
  }

  /** Carbon credit summary scoped to one farmer's own plots (mobile app) */
  async getSummaryForFarmer(farmerId: string): Promise<{
    totalNetCredits: number;
    totalCalculations: number;
    totalCo2e: number;
  }> {
    const result = await this.calculationsRepo
      .createQueryBuilder('calc')
      .innerJoin('calc.instance', 'instance')
      .where('instance.farmerId = :farmerId', { farmerId })
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
}
