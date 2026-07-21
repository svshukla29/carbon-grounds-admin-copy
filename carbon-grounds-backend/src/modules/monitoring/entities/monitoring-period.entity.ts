import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Instance } from '../../instances/entities/instance.entity';
import { Calculation } from '../../calculations/entities/calculation.entity';

export enum MonitoringStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('monitoring_periods')
export class MonitoringPeriod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  instanceId: string;

  @ManyToOne(() => Instance, (instance) => instance.monitoringPeriods, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'instanceId' })
  instance: Instance;

  @Column({ type: 'int', nullable: true })
  periodNumber: number;

  @Column({ nullable: true, length: 100 })
  periodName: string;

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  submittedAt: Date;

  @Column({
    type: 'enum',
    enum: MonitoringStatus,
    default: MonitoringStatus.DRAFT,
  })
  status: MonitoringStatus;

  @Column({ type: 'text', nullable: true })
  adminComments: string;

  @OneToMany(() => Calculation, (calc) => calc.period)
  calculations: Calculation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
