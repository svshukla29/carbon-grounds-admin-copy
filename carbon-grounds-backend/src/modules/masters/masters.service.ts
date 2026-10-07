import { BadRequestException, ConflictException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, IsNull, Not, Repository } from 'typeorm';
import { Tribe } from './entities/tribe.entity';
import { IpccConstant } from './entities/ipcc-constant.entity';
import { EcologicalZone } from './entities/ecological-zone.entity';
import { Gender, FarmerCategory } from '../farmers/entities/farmer.entity';
import { MonitoringFrequency, Instance } from '../instances/entities/instance.entity';
import { MonitoringStatus } from '../monitoring/entities/monitoring-period.entity';
import { CreateEcologicalZoneDto, UpdateEcologicalZoneDto } from './dto/ecological-zone.dto';

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
    description: 'Default below-ground to above-ground biomass ratio (R), used when a plot has no specific ecological zone assigned',
  },
];

// Root:shoot ratios (R) sourced from IPCC 2006 Guidelines Vol.4 Ch.4 Table 4.4.
// Where a Champion & Seth (1968) zone has no directly tabulated IPCC entry, the
// closest same-domain forest type is used instead — labeled as such in `source`
// so the approximation is auditable and can be refined later with better data.
const SEED_ECOLOGICAL_ZONES: Partial<EcologicalZone>[] = [
  { name: 'Tropical Wet Evergreen', domain: 'Tropical', rootShootRatio: 0.37, source: 'IPCC 2006 GL Table 4.4 — Tropical rainforest' },
  { name: 'Tropical Semi-Evergreen', domain: 'Tropical', rootShootRatio: 0.24, source: 'Approximated as IPCC Table 4.4 Tropical moist deciduous forest (AGB > 125 t/ha)' },
  { name: 'Tropical Moist Deciduous', domain: 'Tropical', rootShootRatio: 0.24, source: 'IPCC 2006 GL Table 4.4 — Tropical moist deciduous forest (AGB > 125 t/ha)' },
  { name: 'Littoral and Swamp', domain: 'Tropical', rootShootRatio: 0.24, source: 'Approximated as IPCC Table 4.4 Tropical moist deciduous forest (no distinct IPCC swamp-forest value)' },
  { name: 'Tropical Dry Deciduous', domain: 'Tropical', rootShootRatio: 0.28, source: 'IPCC 2006 GL Table 4.4 — Tropical dry forest (AGB > 20 t/ha)' },
  { name: 'Tropical Thorn', domain: 'Tropical', rootShootRatio: 0.40, source: 'IPCC 2006 GL Table 4.4 — Tropical shrubland' },
  { name: 'Tropical Dry Evergreen', domain: 'Tropical', rootShootRatio: 0.28, source: 'Approximated as IPCC Table 4.4 Tropical dry forest (AGB > 20 t/ha)' },
  { name: 'Sub-Tropical Broadleaf', domain: 'Subtropical', rootShootRatio: 0.24, source: 'IPCC 2006 GL Table 4.4 — Subtropical humid forest (AGB > 125 t/ha)' },
  { name: 'Sub-Tropical Pine', domain: 'Subtropical', rootShootRatio: 0.28, source: 'Approximated as IPCC Table 4.4 Subtropical dry forest (AGB > 20 t/ha)' },
  { name: 'Sub-Tropical Dry Evergreen', domain: 'Subtropical', rootShootRatio: 0.28, source: 'IPCC 2006 GL Table 4.4 — Subtropical dry forest (AGB > 20 t/ha)' },
  { name: 'Montane Wet Temperate', domain: 'Temperate', rootShootRatio: 0.24, source: 'Approximated as IPCC Table 4.4 Temperate other-broadleaf forest (AGB > 150 t/ha)' },
  { name: 'Himalayan Moist Temperate', domain: 'Temperate', rootShootRatio: 0.24, source: 'Approximated as IPCC Table 4.4 Temperate other-broadleaf forest (AGB > 150 t/ha)' },
  { name: 'Himalayan Dry Temperate', domain: 'Temperate', rootShootRatio: 0.29, source: 'Approximated as IPCC Table 4.4 Temperate conifers (AGB 50-150 t/ha)' },
  { name: 'Sub-Alpine', domain: 'Temperate', rootShootRatio: 0.40, source: 'Approximated as IPCC Table 4.4 Temperate conifers, low biomass (AGB < 50 t/ha)' },
  { name: 'Moist Alpine Scrub', domain: 'Temperate', rootShootRatio: 0.40, source: 'Approximated as IPCC Table 4.4 shrubland (low above-ground biomass)' },
  { name: 'Dry Alpine Scrub', domain: 'Temperate', rootShootRatio: 0.40, source: 'Approximated as IPCC Table 4.4 shrubland (low above-ground biomass)' },
  { name: 'Other', domain: null, rootShootRatio: 0.24, source: 'IPCC 2006 GL global default root:shoot ratio — used when the zone is unspecified or custom' },
];

@Injectable()
export class MastersService implements OnModuleInit {
  constructor(
    @InjectRepository(Tribe)
    private tribesRepo: Repository<Tribe>,
    @InjectRepository(IpccConstant)
    private ipccRepo: Repository<IpccConstant>,
    @InjectRepository(EcologicalZone)
    private ecoZonesRepo: Repository<EcologicalZone>,
    @InjectRepository(Instance)
    private instancesRepo: Repository<Instance>,
  ) {}

  async onModuleInit() {
    if ((await this.tribesRepo.count()) === 0) {
      await this.tribesRepo.save(this.tribesRepo.create(SEED_TRIBES));
    }
    if ((await this.ipccRepo.count()) === 0) {
      await this.ipccRepo.save(this.ipccRepo.create(SEED_IPCC_CONSTANTS));
    }
    if ((await this.ecoZonesRepo.count()) === 0) {
      await this.ecoZonesRepo.save(this.ecoZonesRepo.create(SEED_ECOLOGICAL_ZONES));
    }
    await this.backfillInstanceEcologicalZones();
  }

  /**
   * A plot stores its zone by name (what the form sends) and by
   * ecologicalZoneId (what the carbon calculation reads). Plots saved before
   * the link was resolved on save — or whose zone was later changed — can
   * point at no zone or the wrong one. Re-derive the link from the name.
   * Past calculations are unaffected: each stores the ratio it used.
   */
  private async backfillInstanceEcologicalZones() {
    const instances = await this.instancesRepo.find({ where: { ecologicalZone: Not(IsNull()) } });
    if (instances.length === 0) return;

    const zones = await this.ecoZonesRepo.find();
    const zoneIdByName = new Map(zones.map((z) => [z.name, z.id]));

    for (const instance of instances) {
      const expected = zoneIdByName.get(instance.ecologicalZone) ?? null;
      if (instance.ecologicalZoneId !== expected) {
        await this.instancesRepo.update(instance.id, { ecologicalZoneId: expected });
      }
    }
  }

  async getDropdowns() {
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
      // Managed in the dashboard (Climatic Zones); seeded from the Champion &
      // Seth (1968) classification of Indian forest types.
      ecologicalZones: await this.getEcologicalZoneNames(),
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

  getEcologicalZones(includeInactive = false): Promise<EcologicalZone[]> {
    return this.ecoZonesRepo.find({
      where: includeInactive ? {} : { isActive: true },
      order: { name: 'ASC' },
    });
  }

  /** Active zone names for form dropdowns, with "Other" (free text) always last. */
  private async getEcologicalZoneNames(): Promise<string[]> {
    const names = (await this.getEcologicalZones()).map((z) => z.name).filter((n) => n !== 'Other');
    return [...names, 'Other'];
  }

  async createEcologicalZone(dto: CreateEcologicalZoneDto): Promise<EcologicalZone> {
    await this.assertZoneNameFree(dto.name);
    return this.ecoZonesRepo.save(this.ecoZonesRepo.create(dto));
  }

  async updateEcologicalZone(id: string, dto: UpdateEcologicalZoneDto): Promise<EcologicalZone> {
    const zone = await this.ecoZonesRepo.findOne({ where: { id } });
    if (!zone) throw new NotFoundException(`Ecological zone #${id} not found`);

    const oldName = zone.name;
    // "Other" is the plot form's always-present fallback (IPCC default ratio).
    if (oldName === 'Other' && ((dto.name !== undefined && dto.name !== 'Other') || dto.isActive === false)) {
      throw new BadRequestException('The "Other" zone cannot be renamed or deactivated; only its ratio and source can change');
    }
    if (dto.name !== undefined && dto.name !== oldName) await this.assertZoneNameFree(dto.name, id);
    Object.assign(zone, dto);
    const saved = await this.ecoZonesRepo.save(zone);

    // Plots also store the zone's name; keep linked plots showing the new one.
    if (saved.name !== oldName) {
      await this.instancesRepo.update({ ecologicalZoneId: id }, { ecologicalZone: saved.name });
    }
    return saved;
  }

  private async assertZoneNameFree(name: string, exceptId?: string) {
    // Case-insensitive exact match; escape LIKE wildcards in the name itself.
    const pattern = name.replace(/[\\%_]/g, (ch) => `\\${ch}`);
    const existing = await this.ecoZonesRepo.findOne({ where: { name: ILike(pattern) } });
    if (existing && existing.id !== exceptId) {
      throw new ConflictException(`A zone named "${existing.name}" already exists`);
    }
  }
}
