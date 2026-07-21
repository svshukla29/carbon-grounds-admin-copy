import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Instance } from '../../instances/entities/instance.entity';
import { MonitoringPeriod } from '../../monitoring/entities/monitoring-period.entity';

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

  @CreateDateColumn()
  createdAt: Date;
}
