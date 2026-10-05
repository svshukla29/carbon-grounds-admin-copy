import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { State } from './entities/state.entity';
import { District } from './entities/district.entity';
import { Village } from './entities/village.entity';

const SEED_STATES = ['Chhattisgarh'];

const SEED_DISTRICTS: Record<string, string[]> = {
  Chhattisgarh: ['Jashpur'],
};

/**
 * Recovered from the original farmer app's hardcoded Block→Panchayat→Village
 * hierarchy (Constants.kt) — the ~24-entry list once thought lost with the
 * scrapped app. Real Jashpur district data: 8 blocks, ~20 panchayats, ~50
 * villages.
 */
const JASHPUR_HIERARCHY: Record<string, Record<string, string[]>> = {
  Jashpur: {
    Turrilodam: ['Aagdih', 'Harra Dipa', 'Turilodam'],
    Ara: ['Aarra', 'Sakardega', 'Thuthi Amba'],
    Jakba: ['Amera Toli', 'Jakba', 'Koleng'],
    'Bada Koronja': ['Badakorenja', 'Chhota Koranja'],
  },
  Manora: {
    Aasta: ['Asta'],
    Manora: ['Manora', 'Pakari Toli'],
  },
  Kunkuri: {
    Kunkuri: ['Kunkuri', 'Ginatoli', 'Remne'],
    Tapkara: ['Tapkara', 'Dakra', 'Kansabel'],
  },
  Duldula: {
    Duldula: ['Duldula', 'Khutitoli'],
    Kastura: ['Kastura', 'Pakartoli'],
  },
  Pharsabahar: {
    Pharsabahar: ['Pharsabahar', 'Tumla', 'Kinkel'],
    Tapkara: ['Tapkara'],
  },
  Bagicha: {
    Bagicha: ['Bagicha', 'Sanna', 'Durga'],
    Sanna: ['Sanna', 'Kamshima', 'Doomar'],
  },
  Kansabel: {
    Kansabel: ['Kansabel', 'Butanga', 'Dakra'],
    Pusra: ['Pusra'],
  },
  Patthalgaon: {
    Patthalgaon: ['Patthalgaon', 'Ludeg', 'Kachhar'],
    Ludeg: ['Ludeg', 'Kuredegi', 'Bara'],
  },
};

// A few village names are listed under two sibling panchayats in the source
// data (usually the panchayat-headquarters village also appears in a
// neighbour's list) — dedupe per block, preferring the panchayat whose name
// matches the village (its most likely true headquarters).
const seedVillagesByBlockAndName = new Map<string, { name: string; block: string; panchayat: string }>();
for (const [block, panchayats] of Object.entries(JASHPUR_HIERARCHY)) {
  for (const [panchayat, villages] of Object.entries(panchayats)) {
    for (const name of villages) {
      const key = `${block}|${name}`;
      const existing = seedVillagesByBlockAndName.get(key);
      if (!existing || panchayat === name) {
        seedVillagesByBlockAndName.set(key, { name, block, panchayat });
      }
    }
  }
}
const SEED_VILLAGES = Array.from(seedVillagesByBlockAndName.values());

@Injectable()
export class LocationsService implements OnModuleInit {
  constructor(
    @InjectRepository(State)
    private statesRepo: Repository<State>,
    @InjectRepository(District)
    private districtsRepo: Repository<District>,
    @InjectRepository(Village)
    private villagesRepo: Repository<Village>,
  ) {}

  async onModuleInit() {
    if ((await this.statesRepo.count()) > 0) return;

    for (const stateName of SEED_STATES) {
      const state = await this.statesRepo.save(this.statesRepo.create({ name: stateName }));

      for (const districtName of SEED_DISTRICTS[stateName] ?? []) {
        const district = await this.districtsRepo.save(
          this.districtsRepo.create({ name: districtName, stateId: state.id }),
        );

        const villages = districtName === 'Jashpur' ? SEED_VILLAGES : [];
        if (villages.length) {
          await this.villagesRepo.save(
            villages.map((v) =>
              this.villagesRepo.create({ ...v, districtId: district.id }),
            ),
          );
        }
      }
    }
  }

  getStates(): Promise<State[]> {
    return this.statesRepo.find({ order: { name: 'ASC' } });
  }

  async getDistricts(stateName?: string): Promise<District[]> {
    if (!stateName) {
      return this.districtsRepo.find({ order: { name: 'ASC' } });
    }
    return this.districtsRepo
      .createQueryBuilder('district')
      .innerJoin('district.state', 'state')
      .where('state.name = :stateName', { stateName })
      .orderBy('district.name', 'ASC')
      .getMany();
  }

  async getVillages(districtName?: string): Promise<Village[]> {
    if (!districtName) {
      return this.villagesRepo.find({ order: { name: 'ASC' } });
    }
    return this.villagesRepo
      .createQueryBuilder('village')
      .innerJoin('village.district', 'district')
      .where('district.name = :districtName', { districtName })
      .orderBy('village.name', 'ASC')
      .getMany();
  }
}
