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
import { Tribe } from '../../masters/entities/tribe.entity';
import { GramPanchayat } from '../../gram-panchayat/entities/gram-panchayat.entity';
import { Instance } from '../../instances/entities/instance.entity';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHERS = 'OTHERS',
}

export enum FarmerCategory {
  ST = 'ST',
  SC = 'SC',
  OBC = 'OBC',
  GEN = 'GEN',
}

export enum FarmerStatus {
  /** Self-registered via the app, awaiting field-staff verification of land/bank/tribal details */
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
}

@Entity('farmers')
export class Farmer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Auto-generated display ID, e.g. CG26-0011 */
  @Column({ unique: true })
  instanceId: string;

  @Column({ type: 'enum', enum: FarmerStatus, default: FarmerStatus.ACTIVE })
  status: FarmerStatus;

  @Column({ length: 150 })
  farmerName: string;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender: Gender;

  /**
   * Not DB-unique — existing data has duplicate mobile numbers (shared household
   * phones). OTP login resolves ties by picking the most recently created match.
   */
  @Column({ length: 15 })
  mobileNo: string;

  @Column({ type: 'enum', enum: FarmerCategory, nullable: true })
  category: FarmerCategory;

  @Column({ nullable: true })
  tribeId: string;

  @ManyToOne(() => Tribe, { nullable: true, eager: true })
  @JoinColumn({ name: 'tribeId' })
  tribe: Tribe;

  @Column({ default: false })
  bpl: boolean;

  @Column({ nullable: true })
  gramPanchayatId: string;

  @ManyToOne(() => GramPanchayat, (gp) => gp.farmers, { nullable: true })
  @JoinColumn({ name: 'gramPanchayatId' })
  gramPanchayat: GramPanchayat;

  @Column({ length: 150 })
  villageName: string;

  @Column({ nullable: true, length: 50 })
  villageLgdCode: string;

  @Column({ nullable: true, length: 100 })
  block: string;

  @Column({ nullable: true, length: 100 })
  tehsil: string;

  @Column({ nullable: true, length: 100 })
  district: string;

  @Column({ length: 100, default: 'Chhattisgarh' })
  state: string;

  @Column({ nullable: true, length: 10 })
  pinCode: string;

  @Column({ nullable: true, length: 100 })
  khasraNo: string;

  @OneToMany(() => Instance, (instance) => instance.farmer)
  instances: Instance[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
