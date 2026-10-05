import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Farmer } from '../../farmers/entities/farmer.entity';

@Entity('farmer_photos')
export class FarmerPhoto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  farmerId: string;

  @ManyToOne(() => Farmer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'farmerId' })
  farmer: Farmer;

  @Column()
  photoUrl: string;

  @Column()
  fileName: string;

  @Column({ type: 'date', nullable: true })
  takenAt: Date;

  @Column({ nullable: true })
  uploadedById: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
