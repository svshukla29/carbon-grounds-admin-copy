import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Farmer } from '../../farmers/entities/farmer.entity';

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
