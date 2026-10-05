import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Calculation } from './calculation.entity';
import { PlantingUnit } from '../../planting-units/entities/planting-unit.entity';

/**
 * One row per tree per calculation run — a permanent snapshot of the exact
 * inputs used, so a past calculation stays explainable/reproducible even
 * after a tree's DBH is re-measured or a species' constants are edited.
 */
@Entity('calculation_details')
export class CalculationDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  calculationId: string;

  @ManyToOne(() => Calculation, (calc) => calc.details, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'calculationId' })
  calculation: Calculation;

  /** Nullable + SET NULL so this history survives the tree later being deleted. */
  @Column({ type: 'uuid', nullable: true })
  plantingUnitId: string | null;

  @ManyToOne(() => PlantingUnit, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'plantingUnitId' })
  plantingUnit: PlantingUnit | null;

  @Column({ length: 100 })
  treeIdUsed: string;

  @Column({ length: 150 })
  speciesNameUsed: string;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  dbhCmUsed: number;

  @Column({ type: 'decimal', precision: 10, scale: 6 })
  allometricAUsed: number;

  @Column({ type: 'decimal', precision: 10, scale: 6 })
  allometricBUsed: number;

  @Column({ type: 'decimal', precision: 4, scale: 2 })
  carbonFractionUsed: number;

  @Column({ type: 'decimal', precision: 14, scale: 6 })
  agbBiomassKg: number;

  @Column({ type: 'decimal', precision: 14, scale: 6 })
  carbonStockKg: number;

  @CreateDateColumn()
  createdAt: Date;
}
