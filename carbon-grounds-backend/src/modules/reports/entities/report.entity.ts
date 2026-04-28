import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Project } from '../../projects/entities/project.entity';
import { User } from '../../users/entities/user.entity';

export enum ReportStatus {
  DRAFT = 'Draft',
  UNDER_REVIEW = 'Under Review',
  PUBLISHED = 'Published',
}

export enum ReportType {
  QUARTERLY_SUMMARY = 'Quarterly Summary',
  MONTHLY_SUMMARY = 'Monthly Summary',
  VERIFICATION = 'Verification Report',
  IMPACT = 'Impact Report',
  AUDIT = 'Audit Report',
}

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 300 })
  title: string;

  @Column({ type: 'enum', enum: ReportType })
  type: ReportType;

  @Column({ type: 'enum', enum: ReportStatus, default: ReportStatus.DRAFT })
  status: ReportStatus;

  @Column({ type: 'date', nullable: true })
  date: Date;

  @Column({ type: 'text' })
  summary: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ nullable: true })
  fileUrl: string; // path/URL to uploaded attachment

  @Column({ nullable: true })
  fileName: string; // original file name for display

  @ManyToOne(() => Project, (project) => project.reports, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column({ nullable: true })
  projectId: string;

  @ManyToOne(() => User, (user) => user.reports, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column({ nullable: true })
  createdById: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
