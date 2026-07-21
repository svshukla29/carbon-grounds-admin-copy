import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('species')
export class Species {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  commonName: string;

  @Column({ length: 200 })
  scientificName: string;

  @Column({ type: 'decimal', precision: 6, scale: 3, nullable: true })
  woodDensity: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, default: 0.47 })
  carbonFraction: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  allometricA: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  allometricB: number;

  @Column({ type: 'int', nullable: true })
  maxRotationYears: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
