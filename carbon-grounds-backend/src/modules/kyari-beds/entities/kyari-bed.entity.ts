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

@Entity('kyari_beds')
export class KyariBed {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  instanceId: string;

  @ManyToOne(() => Instance, (instance) => instance.kyariBeds, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'instanceId' })
  instance: Instance;

  @Column({ nullable: true, length: 100 })
  bedLabel: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  areaAcres: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
