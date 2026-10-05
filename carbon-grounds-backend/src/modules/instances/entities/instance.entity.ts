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
import { KyariBed } from '../../kyari-beds/entities/kyari-bed.entity';
import { CropArea } from '../../crop-areas/entities/crop-area.entity';
import { EcologicalZone } from '../../masters/entities/ecological-zone.entity';

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

  /**
   * Structured zone link used for the carbon calculation's root:shoot ratio.
   * Kept alongside the free-text `ecologicalZone` above rather than replacing
   * it — existing instances are backfilled by name match on boot
   * (see MastersService.backfillInstanceEcologicalZones).
   */
  @Column({ type: 'uuid', nullable: true })
  ecologicalZoneId: string | null;

  @ManyToOne(() => EcologicalZone, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'ecologicalZoneId' })
  ecologicalZoneRef: EcologicalZone | null;

  @Column({ type: 'date', nullable: true })
  surveyDate: Date;

  @Column({ nullable: true, length: 100, default: 'Rainfed' })
  irrigationType: string;

  @Column({ nullable: true, length: 150 })
  plotName: string;

  @Column({ nullable: true, length: 100 })
  surveyNumber: string;

  @Column({ nullable: true, length: 50 })
  ownershipType: string;

  @Column({ nullable: true, length: 50 })
  soilType: string;

  @Column({ nullable: true, length: 50 })
  plantationType: string;

  @Column({ nullable: true, length: 50 })
  treeSpacing: string;

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

  @OneToMany(() => KyariBed, (bed) => bed.instance)
  kyariBeds: KyariBed[];

  @OneToMany(() => CropArea, (crop) => crop.instance)
  cropAreas: CropArea[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
