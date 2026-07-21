import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Report } from '../../reports/entities/report.entity';

// Status kept for backward-compat but no longer exposed in form
export enum ProjectStatus {
  ACTIVE = 'Active',
  PENDING = 'Pending',
  COMPLETED = 'Completed',
}

export enum ProjectType {
  AGROFORESTRY = 'Agroforestry',
  REFORESTATION = 'Reforestation',
  SOIL_CARBON = 'Soil Carbon',
  BLUE_CARBON = 'Blue Carbon',
  RENEWABLE_ENERGY = 'Renewable Energy',
}

export enum LandType {
  AGRICULTURAL = 'Agricultural',
  FOREST = 'Forest',
  GRASSLAND = 'Grassland',
  WETLAND = 'Wetland',
  DEGRADED = 'Degraded',
  MIXED = 'Mixed',
}

export enum SoilType {
  CLAY = 'Clay',
  SANDY = 'Sandy',
  LOAM = 'Loam',
  SILT = 'Silt',
  PEAT = 'Peat',
  CHALK = 'Chalk',
}

export enum WaterSource {
  RAINFED = 'Rainfed',
  IRRIGATION = 'Irrigation',
  GROUNDWATER = 'Groundwater',
  RIVER = 'River',
  MIXED = 'Mixed',
}

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Project name / label (maps to "Project ID" in UI) */
  @Column({ length: 200 })
  name: string;

  @Column({ type: 'enum', enum: ProjectType })
  type: ProjectType;

  @Column({ length: 200 })
  location: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  carbonCredits: number;

  /** Status kept in DB but not required from the form anymore */
  @Column({ type: 'enum', enum: ProjectStatus, default: ProjectStatus.ACTIVE })
  status: ProjectStatus;

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'text', nullable: true })
  description: string;

  // ─── Land Details ────────────────────────────────────────────────────────────

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  landArea: number; // hectares

  @Column({ type: 'enum', enum: LandType, nullable: true })
  landType: LandType;

  @Column({ type: 'enum', enum: SoilType, nullable: true })
  soilType: SoilType;

  @Column({ type: 'enum', enum: WaterSource, nullable: true })
  waterSource: WaterSource;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  elevation: number; // metres above sea level

  @Column({ length: 100, nullable: true })
  coordinates: string; // GPS coordinates string

  @OneToMany(() => Report, (report) => report.project)
  reports: Report[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
