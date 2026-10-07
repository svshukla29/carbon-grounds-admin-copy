import { ConflictException } from '@nestjs/common';
import { MastersService } from './masters.service';

const ZONES = [
  { id: 'z-moist', name: 'Tropical Moist Deciduous', rootShootRatio: 0.24, isActive: true },
  { id: 'z-dry', name: 'Tropical Dry Deciduous', rootShootRatio: 0.28, isActive: true },
  { id: 'z-other', name: 'Other', rootShootRatio: 0.24, isActive: true },
];

function makeService(instances: any[] = []) {
  const instanceUpdates: any[] = [];
  const ecoZonesRepo: any = {
    count: async () => ZONES.length,
    find: async () => ZONES,
    findOne: async ({ where }: any) => {
      if (where.id) return ZONES.find((z) => z.id === where.id) ?? null;
      const wanted = String(where.name?._value ?? where.name).toLowerCase();
      return ZONES.find((z) => z.name.toLowerCase() === wanted) ?? null;
    },
    save: async (zone: any) => zone,
  };
  const instancesRepo: any = {
    find: async () => instances,
    update: async (criteria: any, changes: any) => instanceUpdates.push([criteria, changes]),
  };
  const counted: any = { count: async () => 1 };
  const service = new MastersService(counted, counted, ecoZonesRepo, instancesRepo);
  return { service, instanceUpdates };
}

describe('MastersService — ecological zones', () => {
  it('re-links plots whose zone link does not match their zone name on startup', async () => {
    const { service, instanceUpdates } = makeService([
      { id: 'p1', ecologicalZone: 'Tropical Dry Deciduous', ecologicalZoneId: 'z-moist' }, // zone changed, link stale
      { id: 'p2', ecologicalZone: 'Tropical Moist Deciduous', ecologicalZoneId: null }, // never linked
      { id: 'p3', ecologicalZone: 'Tropical Moist Deciduous', ecologicalZoneId: 'z-moist' }, // already right
      { id: 'p4', ecologicalZone: 'Sal mixed (custom)', ecologicalZoneId: 'z-dry' }, // custom name -> default ratio
    ]);
    await service.onModuleInit();
    expect(instanceUpdates).toEqual([
      ['p1', { ecologicalZoneId: 'z-dry' }],
      ['p2', { ecologicalZoneId: 'z-moist' }],
      ['p4', { ecologicalZoneId: null }],
    ]);
  });

  it('lists zones for dropdowns with "Other" last', async () => {
    const { service } = makeService();
    const { ecologicalZones } = await service.getDropdowns();
    expect(ecologicalZones).toEqual(['Tropical Moist Deciduous', 'Tropical Dry Deciduous', 'Other']);
  });

  it('renaming a zone renames it on the plots linked to it', async () => {
    const { service, instanceUpdates } = makeService();
    const zone = { ...ZONES[0] };
    (service as any).ecoZonesRepo.findOne = async ({ where }: any) =>
      where.id ? zone : null; // no other zone holds the new name
    await service.updateEcologicalZone('z-moist', { name: 'Tropical Moist Deciduous (IPCC 2019)' });
    expect(instanceUpdates).toEqual([
      [{ ecologicalZoneId: 'z-moist' }, { ecologicalZone: 'Tropical Moist Deciduous (IPCC 2019)' }],
    ]);
  });

  it('rejects a zone name that already exists, ignoring case', async () => {
    const { service } = makeService();
    await expect(
      service.createEcologicalZone({ name: 'tropical dry deciduous', rootShootRatio: 0.3 }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
