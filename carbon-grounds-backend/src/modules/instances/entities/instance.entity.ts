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
import { Farmer } from '../../farmers/entities/farmer.entity';
import { PlantingUnit } from '../../planting-units/entities/planting-unit.entity';
import { MonitoringPeriod } from '../../monitoring/entities/monitoring-period.entity';

export enum MonitoringFrequency {
  ANNUAL = 'ANNUAL',
  SEMI_ANNUAL = 'SEMI_ANNUAL',
  QUARTERLY = 'QUARTERLY',
}

@Entity('instances')
export class Instance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  instanceId: string;

  @Column()
  farmerId: string;

  @ManyToOne(() => Farmer, (farmer) => farmer.instances, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'farmerId' })
  farmer: Farmer;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  areaAcres: number;

  @Column({ nullable: true, length: 100 })
  landUseType: string;

  @Column({ nullable: true, length: 100 })
  ecologicalZone: string;

  @Column({ type: 'date', nullable: true })
  surveyDate: Date;

  @Column({ nullable: true, length: 100, default: 'Rainfed' })
  irrigationType: string;

  @Column({ nullable: true })
  powerAvailability: boolean;

  @Column({ nullable: true })
  internetAvailability: boolean;

  @Column({
    type: 'enum',
    enum: MonitoringFrequency,
    default: MonitoringFrequency.ANNUAL,
  })
  monitoringFrequency: MonitoringFrequency;

  @Column({ type: 'jsonb', nullable: true })
  boundaryGeojson: Record<string, any>;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  gpsLat: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  gpsLng: number;

  @OneToMany(() => PlantingUnit, (unit) => unit.instance)
  plantingUnits: PlantingUnit[];

  @OneToMany(() => MonitoringPeriod, (period) => period.instance)
  monitoringPeriods: MonitoringPeriod[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
