import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PartnerStatus {
  ACTIVE = 'Active',
  PENDING = 'Pending',
  INACTIVE = 'Inactive',
}

export enum PartnerType {
  FUNDING_AGENCY = 'Funding Agency',
  NGO = 'NGO',
  GOVERNMENT = 'Government',
  CORPORATE = 'Corporate',
  RESEARCH = 'Research Institution',
  OTHER = 'Other',
}

@Entity('partners')
export class Partner {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'enum', enum: PartnerType })
  type: PartnerType;

  @Column({ length: 200, nullable: true })
  location: string;

  @Column({ type: 'enum', enum: PartnerStatus, default: PartnerStatus.PENDING })
  status: PartnerStatus;

  @Column({ type: 'date', nullable: true })
  joinDate: Date;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Contact Info
  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ nullable: true, length: 30 })
  phone: string;

  @Column({ nullable: true, length: 150 })
  email: string;

  @Column({ nullable: true, length: 200 })
  website: string;

  // Primary Contact Person
  @Column({ nullable: true, length: 100 })
  contactName: string;

  @Column({ nullable: true, length: 100 })
  contactPosition: string;

  @Column({ nullable: true, length: 150 })
  contactEmail: string;

  @Column({ nullable: true, length: 30 })
  contactPhone: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
