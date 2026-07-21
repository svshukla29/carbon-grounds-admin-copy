import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Tribe } from './entities/tribe.entity';
import { IpccConstant } from './entities/ipcc-constant.entity';
import { Gender, FarmerCategory } from '../farmers/entities/farmer.entity';
import { MonitoringFrequency } from '../instances/entities/instance.entity';
import { MonitoringStatus } from '../monitoring/entities/monitoring-period.entity';

const SEED_TRIBES: Partial<Tribe>[] = [
  { name: 'Baiga', state: 'Chhattisgarh', isPvtg: true },
  { name: 'Pahari Korwa', state: 'Chhattisgarh', isPvtg: true },
  { name: 'Kamar', state: 'Chhattisgarh', isPvtg: true },
  { name: 'Abujh Marhia', state: 'Chhattisgarh', isPvtg: true },
  { name: 'Birhor', state: 'Chhattisgarh', isPvtg: true },
  { name: 'Gond', state: 'Chhattisgarh', isPvtg: false },
  { name: 'Oraon', state: 'Chhattisgarh', isPvtg: false },
  { name: 'Halba', state: 'Chhattisgarh', isPvtg: false },
  { name: 'Kawar', state: 'Chhattisgarh', isPvtg: false },
  { name: 'Bhatra', state: 'Chhattisgarh', isPvtg: false },
  { name: 'Munda', state: 'Chhattisgarh', isPvtg: false },
  { name: 'Tharu', state: 'Uttarakhand', isPvtg: false },
  { name: 'Buksa', state: 'Uttarakhand', isPvtg: false },
  { name: 'Bhotia', state: 'Uttarakhand', isPvtg: false },
  { name: 'Jaunsari', state: 'Uttarakhand', isPvtg: false },
  { name: 'Raji', state: 'Uttarakhand', isPvtg: true },
];

const SEED_IPCC_CONSTANTS: Partial<IpccConstant>[] = [
  {
    name: 'CARBON_FRACTION_DEFAULT',
    value: 0.47,
    description: 'Default carbon fraction of dry biomass (IPCC default, CF)',
  },
  {
    name: 'CO2_TO_C_RATIO',
    value: 3.6667,
    description: 'Conversion ratio of CO2 to carbon (44/12)',
  },
  {
    name: 'ROOT_SHOOT_RATIO_DEFAULT',
    value: 0.24,
    description: 'Default below-ground to above-ground biomass ratio (R)',
  },
];

@Injectable()
export class MastersService implements OnModuleInit {
  constructor(
    @InjectRepository(Tribe)
    private tribesRepo: Repository<Tribe>,
    @InjectRepository(IpccConstant)
    private ipccRepo: Repository<IpccConstant>,
  ) {}

  async onModuleInit() {
    if ((await this.tribesRepo.count()) === 0) {
      await this.tribesRepo.save(this.tribesRepo.create(SEED_TRIBES));
    }
    if ((await this.ipccRepo.count()) === 0) {
      await this.ipccRepo.save(this.ipccRepo.create(SEED_IPCC_CONSTANTS));
    }
  }

  getDropdowns() {
    return {
      genders: Object.values(Gender),
      categories: Object.values(FarmerCategory),
      states: ['Chhattisgarh', 'Uttarakhand'],
      landUseTypes: [
        'Agricultural Land',
        'Fallow Land',
        'Degraded Forest',
        'Wasteland',
        'Homestead',
      ],
      ecologicalZones: [
        'Tropical Dry Deciduous',
        'Tropical Moist Deciduous',
        'Sub-Tropical Pine',
        'Sub-Tropical Broadleaf',
      ],
      irrigationTypes: ['Rainfed', 'Irrigated', 'Mixed'],
      monitoringFrequencies: Object.values(MonitoringFrequency),
      monitoringStatuses: Object.values(MonitoringStatus),
    };
  }

  getTribes(state?: string, pvtgOnly?: boolean): Promise<Tribe[]> {
    const where: Record<string, any> = {};
    if (state) where.state = state;
    if (pvtgOnly) where.isPvtg = true;
    return this.tribesRepo.find({ where, order: { name: 'ASC' } });
  }

  searchTribes(q: string): Promise<Tribe[]> {
    return this.tribesRepo.find({
      where: { name: ILike(`%${q}%`) },
      order: { name: 'ASC' },
      take: 20,
    });
  }

  getIpccConstants(): Promise<IpccConstant[]> {
    return this.ipccRepo.find({ order: { name: 'ASC' } });
  }
}
