import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { Farmer } from '../../farmers/entities/farmer.entity';
import { Report } from '../../reports/entities/report.entity';

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
}

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'enum', enum: ProjectType })
  type: ProjectType;

  @Column({ length: 200 })
  location: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  carbonCredits: number;

  @Column({ type: 'enum', enum: ProjectStatus, default: ProjectStatus.PENDING })
  status: ProjectStatus;

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToMany(() => Farmer, (farmer) => farmer.projects)
  @JoinTable({
    name: 'project_farmers',
    joinColumn: { name: 'projectId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'farmerId', referencedColumnName: 'id' },
  })
  farmers: Farmer[];

  @OneToMany(() => Report, (report) => report.project)
  reports: Report[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
