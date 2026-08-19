import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MonitoringPeriod } from '../../monitoring/entities/monitoring-period.entity';

@Entity('monitoring_checklist_items')
export class MonitoringChecklistItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  monitoringPeriodId: string;

  @ManyToOne(() => MonitoringPeriod, (period) => period.checklistItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'monitoringPeriodId' })
  period: MonitoringPeriod;

  @Column({ length: 255 })
  label: string;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ default: false })
  completed: boolean;

  @Column({ type: 'text', nullable: true })
  remarks: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
