import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PlantingUnit } from '../../planting-units/entities/planting-unit.entity';
import { MonitoringPeriod } from '../../monitoring/entities/monitoring-period.entity';

@Entity('tree_measurements')
export class TreeMeasurement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  plantingUnitId: string;

  @ManyToOne(() => PlantingUnit, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plantingUnitId' })
  plantingUnit: PlantingUnit;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  heightM: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  dbhCm: number;

  @Column({ nullable: true, length: 50 })
  healthStatus: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  gpsLat: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  gpsLng: number;

  @Column({ type: 'date' })
  measuredAt: Date;

  @Column({ nullable: true })
  measuredById: string;

  /** Optional link to the monitoring visit this measurement was taken during
   * — mirrors the same dual-link pattern already used on TreePhoto. */
  @Column({ type: 'uuid', nullable: true })
  monitoringPeriodId: string | null;

  @ManyToOne(() => MonitoringPeriod, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'monitoringPeriodId' })
  monitoringPeriod: MonitoringPeriod | null;

  @CreateDateColumn()
  createdAt: Date;
}
