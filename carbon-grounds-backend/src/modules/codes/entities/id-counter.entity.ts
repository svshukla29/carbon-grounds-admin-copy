import { Entity, PrimaryColumn, Column } from 'typeorm';

/** Tracks the last issued sequence number per scope so generated codes never repeat, even after deletions */
@Entity('id_counters')
export class IdCounter {
  @PrimaryColumn()
  scope: string;

  @Column({ type: 'int', default: 0 })
  lastValue: number;
}
