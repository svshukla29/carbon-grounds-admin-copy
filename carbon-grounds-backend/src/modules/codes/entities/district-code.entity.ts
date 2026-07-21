import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

/** Persists the derived short code for each (state, district) pair so it stays stable over time */
@Entity('district_codes')
@Unique(['state', 'district'])
@Unique(['state', 'code'])
export class DistrictCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  state: string;

  @Column({ length: 100 })
  district: string;

  @Column({ length: 10 })
  code: string;
}
