import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('ecological_zones')
export class EcologicalZone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, unique: true })
  name: string;

  /** IPCC climate domain this zone falls under (Tropical / Subtropical / Temperate). */
  @Column({ type: 'varchar', length: 20, nullable: true })
  domain: string | null;

  /** Below-ground : above-ground biomass ratio (R), IPCC 2006 GL Table 4.4. */
  @Column({ type: 'decimal', precision: 4, scale: 2 })
  rootShootRatio: number;

  /** Where rootShootRatio came from — a direct IPCC match or a documented approximation. */
  @Column({ type: 'text', nullable: true })
  source: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
