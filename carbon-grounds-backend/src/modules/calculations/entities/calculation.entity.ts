import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Instance } from '../../instances/entities/instance.entity';
import { MonitoringPeriod } from '../../monitoring/entities/monitoring-period.entity';
import { CalculationDetail } from './calculation-detail.entity';

@Entity('calculations')
export class Calculation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  instanceId: string;

  @ManyToOne(() => Instance, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'instanceId' })
  instance: Instance;

  @Column()
  periodId: string;

  @ManyToOne(() => MonitoringPeriod, (period) => period.calculations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'periodId' })
  period: MonitoringPeriod;

  @Column({ type: 'decimal', precision: 14, scale: 4 })
  agbBiomass: number;

  @Column({ type: 'decimal', precision: 14, scale: 4 })
  carbonStock: number;

  @Column({ type: 'decimal', precision: 14, scale: 4 })
  co2e: number;

  @Column({ type: 'decimal', precision: 14, scale: 4 })
  netCredits: number;

  /** Set when these credits are permanently retired (used/cancelled) — null while still active. */
  @Column({ type: 'timestamp', nullable: true })
  retiredAt: Date | null;

  @Column({ type: 'text', nullable: true })
  retirementReason: string | null;

  /** Tags which version of the formula produced this row — lets old and new
   * calculations coexist legibly once the formula changes (e.g. root:shoot
   * ratio being added). */
  @Column({ length: 50, default: 'v1-dbh-allometric' })
  formulaVersion: string;

  /** Snapshot of the zone used at calculation time — the instance's own zone
   * link can change later, so this is what actually explains this result. */
  @Column({ type: 'uuid', nullable: true })
  ecologicalZoneId: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ecologicalZoneNameUsed: string | null;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  rootShootRatioUsed: number | null;

  @OneToMany(() => CalculationDetail, (detail) => detail.calculation)
  details: CalculationDetail[];

  @CreateDateColumn()
  createdAt: Date;
}
