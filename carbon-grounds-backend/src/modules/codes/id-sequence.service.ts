import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class IdSequenceService {
  constructor(private dataSource: DataSource) {}

  /** Atomically reserves `count` new numbers in `scope` and returns the last one in the batch */
  async nextBatch(scope: string, count = 1): Promise<number> {
    const result = await this.dataSource.query(
      `INSERT INTO id_counters (scope, "lastValue") VALUES ($1, $2)
       ON CONFLICT (scope) DO UPDATE SET "lastValue" = id_counters."lastValue" + $2
       RETURNING "lastValue"`,
      [scope, count],
    );
    return result[0].lastValue;
  }

  next(scope: string): Promise<number> {
    return this.nextBatch(scope, 1);
  }
}
