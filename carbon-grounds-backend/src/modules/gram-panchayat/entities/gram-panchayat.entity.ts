import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Farmer } from '../../farmers/entities/farmer.entity';
import { Project } from '../../projects/entities/project.entity';

@Entity('gram_panchayats')
export class GramPanchayat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  gpName: string;

  @Column({ unique: true, length: 50 })
  lgdCode: string;

  /** Auto-generated display code, e.g. GP-JH-RAN-1 */
  @Column({ unique: true, nullable: true, length: 50 })
  gpCode: string;

  @Column({ length: 100 })
  state: string;

  @Column({ length: 100 })
  district: string;

  @Column({ nullable: true, length: 100 })
  block: string;

  @Column({ nullable: true, length: 150 })
  sachivName: string;

  @Column({ nullable: true, length: 20 })
  sachivPhone: string;

  @Column({ nullable: true, length: 150 })
  contact1Name: string;

  @Column({ nullable: true, length: 20 })
  contact1Phone: string;

  @OneToMany(() => Farmer, (farmer) => farmer.gramPanchayat)
  farmers: Farmer[];

  /** Which Project (a grouping of many GPs) this Gram Panchayat belongs to, if any. */
  @Column({ type: 'uuid', nullable: true })
  projectId: string | null;

  @ManyToOne(() => Project, (project) => project.gramPanchayats, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'projectId' })
  project: Project | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
