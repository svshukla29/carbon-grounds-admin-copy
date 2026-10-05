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
import { Instance } from '../../instances/entities/instance.entity';
import { Species } from '../../species/entities/species.entity';
import { TreePhoto } from '../../tree-photos/entities/tree-photo.entity';
import { TreeMeasurement } from '../../tree-measurements/entities/tree-measurement.entity';

export enum PlantingUnitStatus {
  ALIVE = 'ALIVE',
  DEAD = 'DEAD',
  LOST = 'LOST',
  REPLACED = 'REPLACED',
}

@Entity('planting_units')
export class PlantingUnit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  treeId: string;

  @Column()
  instanceId: string;

  @ManyToOne(() => Instance, (instance) => instance.plantingUnits, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'instanceId' })
  instance: Instance;

  @Column()
  speciesId: string;

  @ManyToOne(() => Species, { eager: true })
  @JoinColumn({ name: 'speciesId' })
  species: Species;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  dbhCm: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  heightM: number;

  @Column({ type: 'date', nullable: true })
  plantingDate: Date;

  @Column({ type: 'date', nullable: true })
  lossDate: Date | null;

  @Column({ type: 'enum', enum: PlantingUnitStatus, default: PlantingUnitStatus.ALIVE })
  status: PlantingUnitStatus;

  @Column({ type: 'text', nullable: true })
  lossReason: string | null;

  /** Set when this tree was planted as a replacement for another — the
   * predecessor is marked REPLACED rather than deleted, so its full
   * measurement/photo history survives and stays linked. */
  @Column({ type: 'uuid', nullable: true })
  predecessorUnitId: string | null;

  @ManyToOne(() => PlantingUnit, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'predecessorUnitId' })
  predecessorUnit: PlantingUnit | null;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  gpsLat: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  gpsLng: number;

  @Column({ nullable: true, length: 50 })
  healthStatus: string;

  @Column({ nullable: true, length: 100 })
  qrCode: string;

  @OneToMany(() => TreePhoto, (photo) => photo.plantingUnit)
  photos: TreePhoto[];

  @OneToMany(() => TreeMeasurement, (measurement) => measurement.plantingUnit)
  measurements: TreeMeasurement[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
