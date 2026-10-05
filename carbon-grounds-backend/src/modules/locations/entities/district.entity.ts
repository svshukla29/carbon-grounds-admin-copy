import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Unique,
} from 'typeorm';
import { State } from './state.entity';
import { Village } from './village.entity';

@Entity('districts')
@Unique(['stateId', 'name'])
export class District {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column()
  stateId: string;

  @ManyToOne(() => State, (state) => state.districts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'stateId' })
  state: State;

  @OneToMany(() => Village, (village) => village.district)
  villages: Village[];
}
