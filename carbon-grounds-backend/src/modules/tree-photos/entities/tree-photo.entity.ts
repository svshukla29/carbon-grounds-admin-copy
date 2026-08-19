import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PlantingUnit } from '../../planting-units/entities/planting-unit.entity';
import { MonitoringPeriod } from '../../monitoring/entities/monitoring-period.entity';

@Entity('tree_photos')
export class TreePhoto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  plantingUnitId: string;

  @ManyToOne(() => PlantingUnit, (unit) => unit.photos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'plantingUnitId' })
  plantingUnit: PlantingUnit;

  @Column()
  photoUrl: string;

  @Column()
  fileName: string;

  @Column({ type: 'date', nullable: true })
  takenAt: Date;

  @Column({ nullable: true })
  monitoringPeriodId: string;

  @ManyToOne(() => MonitoringPeriod, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'monitoringPeriodId' })
  monitoringPeriod: MonitoringPeriod;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  uploadedById: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
