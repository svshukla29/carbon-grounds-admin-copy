import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Report } from '../../reports/entities/report.entity';
import { GramPanchayat } from '../../gram-panchayat/entities/gram-panchayat.entity';

/**
 * A Project is a grouping of Gram Panchayats — the highest level in the
 * reporting hierarchy (Project → Gram Panchayat → Farmer → Instance → Tree).
 */
@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @OneToMany(() => GramPanchayat, (gp) => gp.project)
  gramPanchayats: GramPanchayat[];

  @OneToMany(() => Report, (report) => report.project)
  reports: Report[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
