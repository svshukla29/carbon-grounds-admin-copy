import { PlantingUnitsService } from './planting-units.service';
import { PlantingUnitStatus } from './entities/planting-unit.entity';

/** A query builder stub that records the scope filter and returns `trees`. */
function queryBuilderReturning(trees: any[], calls: string[]) {
  const qb: any = {};
  for (const method of ['leftJoinAndSelect', 'innerJoinAndSelect', 'innerJoin', 'orderBy', 'addOrderBy']) {
    qb[method] = () => qb;
  }
  qb.where = (clause: string) => {
    calls.push(clause);
    return qb;
  };
  qb.getMany = async () => trees;
  return qb;
}

describe('PlantingUnitsService.getHistoryRows', () => {
  const original = {
    id: 'pu-1',
    treeId: 'TR-INS1-1',
    instance: { instanceId: 'INS-FR1-1' },
    species: { commonName: 'Mango' },
    plantingDate: new Date('2024-07-01'),
    status: PlantingUnitStatus.REPLACED,
    lossDate: new Date('2025-08-01'),
    lossReason: 'Termites',
    predecessorUnitId: null,
    createdAt: new Date('2024-07-01'),
  };
  const replacement = {
    id: 'pu-2',
    treeId: 'TR-INS1-2',
    instance: { instanceId: 'INS-FR1-1' },
    species: { commonName: 'Mango' },
    plantingDate: new Date('2025-08-05'),
    status: PlantingUnitStatus.ALIVE,
    lossDate: null,
    lossReason: null,
    predecessorUnitId: 'pu-1',
    createdAt: new Date('2025-08-05'),
  };

  function serviceWith(trees: any[], calls: string[]) {
    const plantingUnitsRepo: any = {
      createQueryBuilder: () => queryBuilderReturning(trees, calls),
      find: async ({ where }: any) =>
        where.predecessorUnitId ? [replacement] : where.id ? [original] : [],
    };
    const treeMeasurementsRepo: any = {
      find: async () => [
        { plantingUnitId: 'pu-1', measuredAt: new Date('2025-01-01'), dbhCm: 3, heightM: 1.2 },
      ],
    };
    const treePhotosRepo: any = { find: async () => [] };
    return new PlantingUnitsService(plantingUnitsRepo, {} as any, treeMeasurementsRepo, treePhotosRepo, {} as any);
  }

  it('flattens each tree into dated events, linking a replacement both ways', async () => {
    const calls: string[] = [];
    const rows = await serviceWith([original, replacement], calls).getHistoryRows({ gramPanchayatId: 'gp-1' });

    expect(calls).toEqual(['farmer.gramPanchayatId = :id']);
    expect(rows.map((r) => [r.treeId, r.type, r.description])).toEqual([
      ['TR-INS1-1', 'PLANTED', 'Planted (Mango)'],
      ['TR-INS1-1', 'MEASUREMENT', 'DBH 3cm, Height 1.2m'],
      ['TR-INS1-1', 'REPLACED', 'Replaced by TR-INS1-2 — Termites'],
      ['TR-INS1-2', 'PLANTED', 'Planted (Mango)'],
      ['TR-INS1-2', 'REPLACEMENT', 'Planted as a replacement for TR-INS1-1'],
    ]);
    expect(rows[0].plotId).toBe('INS-FR1-1');
  });

  it('returns no rows (and skips the follow-up queries) when the scope has no trees', async () => {
    const rows = await serviceWith([], []).getHistoryRows({ projectId: 'p-1' });
    expect(rows).toEqual([]);
  });
});
