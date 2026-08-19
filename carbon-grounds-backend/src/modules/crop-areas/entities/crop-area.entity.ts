import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Instance } from '../../instances/entities/instance.entity';

@Entity('crop_areas')
export class CropArea {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  instanceId: string;

  @ManyToOne(() => Instance, (instance) => instance.cropAreas, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'instanceId' })
  instance: Instance;

  @Column({ nullable: true, length: 100 })
  cropName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  areaAcres: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
