import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DistrictCode } from './entities/district-code.entity';

@Injectable()
export class DistrictCodeService {
  constructor(
    @InjectRepository(DistrictCode)
    private districtCodeRepo: Repository<DistrictCode>,
  ) {}

  /** Returns the stable short code for a (state, district) pair, deriving and persisting one if needed */
  async getCode(state: string, district: string): Promise<string> {
    const existing = await this.districtCodeRepo.findOne({ where: { state, district } });
    if (existing) return existing.code;

    const letters = (district || '').replace(/[^a-zA-Z]/g, '').toUpperCase();
    let length = 3;
    let candidate = letters.slice(0, length) || 'GEN';

    while (await this.districtCodeRepo.findOne({ where: { state, code: candidate } })) {
      length += 1;
      if (length > letters.length + 2) {
        candidate = `${letters.slice(0, 3) || 'GEN'}${Math.floor(Math.random() * 90 + 10)}`;
        break;
      }
      candidate = letters.slice(0, length);
    }

    const saved = await this.districtCodeRepo.save(
      this.districtCodeRepo.create({ state, district, code: candidate }),
    );
    return saved.code;
  }
}
