import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { District } from './district.entity';

@Entity('villages')
@Unique(['districtId', 'block', 'name'])
export class Village {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  name: string;

  @Column()
  districtId: string;

  @ManyToOne(() => District, (district) => district.villages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'districtId' })
  district: District;

  @Column({ nullable: true, length: 100 })
  block: string;

  @Column({ nullable: true, length: 100 })
  panchayat: string;

  @Column({ nullable: true, length: 50 })
  lgdCode: string;
}
