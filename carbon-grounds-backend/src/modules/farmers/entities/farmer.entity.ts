import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import { Project } from '../../projects/entities/project.entity';

export enum FarmerStatus {
  VERIFIED = 'Verified',
  PENDING = 'Pending',
}

@Entity('farmers')
export class Farmer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ length: 200 })
  location: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  area: number; // in hectares

  @Column({ type: 'text', array: true, default: '{}' })
  crops: string[];

  @Column({ type: 'text', array: true, default: '{}' })
  certifications: string[];

  @Column({ type: 'enum', enum: FarmerStatus, default: FarmerStatus.PENDING })
  status: FarmerStatus;

  @Column({ type: 'date', nullable: true })
  joinDate: Date;

  @Column({ nullable: true, length: 30 })
  phone: string;

  @Column({ nullable: true, length: 150 })
  email: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @ManyToMany(() => Project, (project) => project.farmers)
  projects: Project[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
