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

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  gpsLat: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  gpsLng: number;

  @OneToMany(() => TreePhoto, (photo) => photo.plantingUnit)
  photos: TreePhoto[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
