import { ForbiddenException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Not, Repository } from 'typeorm';
import { PlantingUnit, PlantingUnitStatus } from './entities/planting-unit.entity';
import { Instance } from '../instances/entities/instance.entity';
import { TreeMeasurement } from '../tree-measurements/entities/tree-measurement.entity';
import { TreePhoto } from '../tree-photos/entities/tree-photo.entity';
import { CreatePlantingUnitDto } from './dto/create-planting-unit.dto';
import { UpdatePlantingUnitDto } from './dto/update-planting-unit.dto';
import { BulkCreatePlantingUnitsDto } from './dto/bulk-create-planting-units.dto';
import { MarkLossDto, LossStatus } from './dto/mark-loss.dto';
import { ReplaceTreeDto } from './dto/replace-tree.dto';
import { IdSequenceService } from '../codes/id-sequence.service';
import { extractSeq } from '../codes/code-generator.util';

export interface HistoryEvent {
  date: Date | string;
  type: string;
  description: string;
}

/** One timeline event of one tree, as written to the Excel reports. */
export interface TreeHistoryRow extends HistoryEvent {
  plotId: string;
  treeId: string;
  species: string;
  currentStatus: PlantingUnitStatus;
  plantingDate: Date | null;
}

/**
 * Builds a tree's dated timeline (planted, replacement, measurements, photos,
 * dead/lost/replaced). Shared by the History dialog and the Excel reports so
 * both always tell the same story.
 */
export function buildTreeEvents(
  tree: PlantingUnit,
  measurements: TreeMeasurement[],
  photos: TreePhoto[],
  predecessor: PlantingUnit | null,
  successor: PlantingUnit | null,
): HistoryEvent[] {
  const events: HistoryEvent[] = [];

  if (tree.plantingDate) {
    events.push({
      date: tree.plantingDate,
      type: 'PLANTED',
      description: `Planted (${tree.species?.commonName ?? 'species unknown'})`,
    });
  }
  if (predecessor) {
    events.push({
      date: tree.createdAt,
      type: 'REPLACEMENT',
      description: `Planted as a replacement for ${predecessor.treeId}`,
    });
  }
  for (const m of measurements) {
    const parts = [
      m.dbhCm != null ? `DBH ${m.dbhCm}cm` : null,
      m.heightM != null ? `Height ${m.heightM}m` : null,
      m.healthStatus ? `health: ${m.healthStatus}` : null,
    ].filter(Boolean);
    events.push({
      date: m.measuredAt,
      type: 'MEASUREMENT',
      description: parts.join(', ') + (m.notes ? ` — ${m.notes}` : ''),
    });
  }
  for (const p of photos) {
    events.push({
      date: p.takenAt ?? p.createdAt,
      type: 'PHOTO',
      description: p.notes || 'Photo uploaded',
    });
  }
  if (tree.lossDate) {
    events.push({
      date: tree.lossDate,
      type: tree.status,
      description:
        tree.status === PlantingUnitStatus.REPLACED && successor
          ? `Replaced by ${successor.treeId}${tree.lossReason ? ` — ${tree.lossReason}` : ''}`
          : `Marked ${tree.status}${tree.lossReason ? ` — ${tree.lossReason}` : ''}`,
    });
  }

  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return events;
}

@Injectable()
export class PlantingUnitsService implements OnModuleInit {
  constructor(
    @InjectRepository(PlantingUnit)
    private plantingUnitsRepo: Repository<PlantingUnit>,
    @InjectRepository(Instance)
    private instancesRepo: Repository<Instance>,
    @InjectRepository(TreeMeasurement)
    private treeMeasurementsRepo: Repository<TreeMeasurement>,
    @InjectRepository(TreePhoto)
    private treePhotosRepo: Repository<TreePhoto>,
    private idSequenceService: IdSequenceService,
  ) {}

  /**
   * The `status` enum is new; every pre-existing row defaults to ALIVE
   * regardless of its actual `lossDate`. Backfill status from the legacy
   * lossDate-only signal once on boot so old "lost" trees aren't silently
   * shown as alive.
   */
  async onModuleInit() {
    await this.plantingUnitsRepo.update(
      { lossDate: Not(IsNull()), status: PlantingUnitStatus.ALIVE },
      { status: PlantingUnitStatus.LOST },
    );
  }

  async findInstanceOrThrow(instanceId: string): Promise<Instance> {
    const instance = await this.instancesRepo.findOne({ where: { id: instanceId } });
    if (!instance) throw new NotFoundException(`Instance #${instanceId} not found`);
    return instance;
  }

  /** @param requesterFarmerId When set (farmer JWT), the instance must belong to this farmer. */
  async create(dto: CreatePlantingUnitDto, requesterFarmerId?: string): Promise<PlantingUnit> {
    const instance = await this.findInstanceOrThrow(dto.instanceId);
    if (requesterFarmerId && instance.farmerId !== requesterFarmerId) {
      throw new ForbiddenException('You can only add trees to your own farm plot');
    }
    const instanceSeq = extractSeq(instance.instanceId);
    const seq = await this.idSequenceService.next(`TR:${instance.id}`);
    const treeId = `TR-INS${instanceSeq}-${seq}`;
    return this.plantingUnitsRepo.save(this.plantingUnitsRepo.create({ ...dto, treeId }));
  }

  async bulkCreate(dto: BulkCreatePlantingUnitsDto): Promise<PlantingUnit[]> {
    const instance = await this.findInstanceOrThrow(dto.instanceId);
    const instanceSeq = extractSeq(instance.instanceId);
    const count = dto.units.length;
    const lastSeq = await this.idSequenceService.nextBatch(`TR:${instance.id}`, count);
    const startSeq = lastSeq - count + 1;

    const units = dto.units.map((unit, idx) =>
      this.plantingUnitsRepo.create({
        ...unit,
        instanceId: dto.instanceId,
        treeId: `TR-INS${instanceSeq}-${startSeq + idx}`,
      }),
    );
    return this.plantingUnitsRepo.save(units);
  }

  findByInstance(instanceId: string): Promise<PlantingUnit[]> {
    return this.plantingUnitsRepo.find({
      where: { instanceId },
      relations: ['species'],
      order: { createdAt: 'DESC' },
    });
  }

  /** Tree records joined with plot, farmer and gram panchayat details for export */
  exportTrees(filters?: { species?: string; instanceId?: string }): Promise<PlantingUnit[]> {
    const qb = this.plantingUnitsRepo
      .createQueryBuilder('unit')
      .leftJoinAndSelect('unit.species', 'species')
      .leftJoinAndSelect('unit.instance', 'instance')
      .leftJoinAndSelect('instance.farmer', 'farmer')
      .leftJoinAndSelect('farmer.gramPanchayat', 'gramPanchayat')
      .orderBy('unit.treeId', 'ASC');

    if (filters?.species) {
      qb.andWhere('species.commonName ILIKE :species', { species: `%${filters.species}%` });
    }
    if (filters?.instanceId) {
      qb.andWhere('unit.instanceId = :instanceId', { instanceId: filters.instanceId });
    }

    return qb.getMany();
  }

  async findOne(id: string): Promise<PlantingUnit> {
    const unit = await this.plantingUnitsRepo.findOne({
      where: { id },
      relations: ['species', 'instance'],
    });
    if (!unit) throw new NotFoundException(`Planting unit #${id} not found`);
    return unit;
  }

  async update(id: string, dto: UpdatePlantingUnitDto): Promise<PlantingUnit> {
    const unit = await this.plantingUnitsRepo.findOne({ where: { id } });
    if (!unit) throw new NotFoundException(`Planting unit #${id} not found`);
    Object.assign(unit, dto);
    await this.plantingUnitsRepo.save(unit);
    return this.findOne(id);
  }

  async markLoss(id: string, dto: MarkLossDto): Promise<PlantingUnit> {
    const unit = await this.plantingUnitsRepo.findOne({ where: { id } });
    if (!unit) throw new NotFoundException(`Planting unit #${id} not found`);
    unit.lossDate = new Date(dto.lossDate);
    unit.status = dto.status === LossStatus.DEAD ? PlantingUnitStatus.DEAD : PlantingUnitStatus.LOST;
    unit.lossReason = dto.reason ?? null;
    await this.plantingUnitsRepo.save(unit);
    return this.findOne(id);
  }

  async restoreAlive(id: string): Promise<PlantingUnit> {
    const unit = await this.plantingUnitsRepo.findOne({ where: { id } });
    if (!unit) throw new NotFoundException(`Planting unit #${id} not found`);
    unit.lossDate = null;
    unit.status = PlantingUnitStatus.ALIVE;
    unit.lossReason = null;
    await this.plantingUnitsRepo.save(unit);
    return this.findOne(id);
  }

  /**
   * Marks a tree Dead/Lost and plants its replacement — reusing the same
   * per-instance tree-numbering sequence as normal tree creation, and
   * defaulting the new tree's GPS to the old tree's location since it's
   * usually seeded at the same spot.
   */
  async replace(id: string, dto: ReplaceTreeDto): Promise<PlantingUnit> {
    const oldUnit = await this.plantingUnitsRepo.findOne({ where: { id } });
    if (!oldUnit) throw new NotFoundException(`Planting unit #${id} not found`);

    oldUnit.status = PlantingUnitStatus.REPLACED;
    if (!oldUnit.lossDate) oldUnit.lossDate = new Date();
    if (dto.reason) oldUnit.lossReason = dto.reason;
    await this.plantingUnitsRepo.save(oldUnit);

    const instance = await this.findInstanceOrThrow(oldUnit.instanceId);
    const instanceSeq = extractSeq(instance.instanceId);
    const seq = await this.idSequenceService.next(`TR:${instance.id}`);
    const treeId = `TR-INS${instanceSeq}-${seq}`;

    const newUnit = this.plantingUnitsRepo.create({
      instanceId: oldUnit.instanceId,
      speciesId: dto.speciesId ?? oldUnit.speciesId,
      dbhCm: dto.dbhCm,
      heightM: dto.heightM,
      plantingDate: dto.plantingDate as any,
      gpsLat: dto.gpsLat ?? oldUnit.gpsLat,
      gpsLng: dto.gpsLng ?? oldUnit.gpsLng,
      treeId,
      predecessorUnitId: oldUnit.id,
      status: PlantingUnitStatus.ALIVE,
    });
    const saved = await this.plantingUnitsRepo.save(newUnit);
    return this.findOne(saved.id);
  }

  /**
   * Full lifecycle timeline for a tree — planting, measurements, photos,
   * and any replacement link in either direction. This is the same data
   * backing both the tree detail "History" tab and Gram-Panchayat/Instance
   * reports' per-tree history requirement.
   */
  async getHistory(id: string): Promise<{
    tree: PlantingUnit;
    predecessor: PlantingUnit | null;
    successor: PlantingUnit | null;
    events: HistoryEvent[];
  }> {
    const tree = await this.findOne(id);

    const [measurements, photos, predecessor, successor] = await Promise.all([
      this.treeMeasurementsRepo.find({ where: { plantingUnitId: id }, order: { measuredAt: 'ASC' } }),
      this.treePhotosRepo.find({ where: { plantingUnitId: id }, order: { createdAt: 'ASC' } }),
      tree.predecessorUnitId
        ? this.plantingUnitsRepo.findOne({ where: { id: tree.predecessorUnitId } })
        : Promise.resolve(null),
      this.plantingUnitsRepo.findOne({ where: { predecessorUnitId: id } }),
    ]);

    const events = buildTreeEvents(tree, measurements, photos, predecessor, successor);

    return { tree, predecessor, successor, events };
  }

  /**
   * Every tree's timeline in a plot, Gram Panchayat or project, flattened to
   * one row per event for the Excel reports. Loads measurements, photos and
   * replacement links for all trees in a handful of queries rather than per tree.
   */
  async getHistoryRows(scope: { instanceId?: string; gramPanchayatId?: string; projectId?: string }): Promise<TreeHistoryRow[]> {
    const qb = this.plantingUnitsRepo
      .createQueryBuilder('pu')
      .leftJoinAndSelect('pu.species', 'species')
      .innerJoinAndSelect('pu.instance', 'instance')
      .innerJoin('instance.farmer', 'farmer')
      .orderBy('instance.instanceId', 'ASC')
      .addOrderBy('pu.treeId', 'ASC');
    if (scope.instanceId) {
      qb.where('pu.instanceId = :id', { id: scope.instanceId });
    } else if (scope.gramPanchayatId) {
      qb.where('farmer.gramPanchayatId = :id', { id: scope.gramPanchayatId });
    } else if (scope.projectId) {
      qb.innerJoin('farmer.gramPanchayat', 'gp').where('gp.projectId = :id', { id: scope.projectId });
    } else {
      throw new Error('getHistoryRows needs an instanceId, gramPanchayatId or projectId');
    }

    const trees = await qb.getMany();
    if (trees.length === 0) return [];

    const ids = trees.map((t) => t.id);
    const predecessorIds = trees.map((t) => t.predecessorUnitId).filter((id): id is string => !!id);
    const [measurements, photos, successors, predecessors] = await Promise.all([
      this.treeMeasurementsRepo.find({ where: { plantingUnitId: In(ids) }, order: { measuredAt: 'ASC' } }),
      this.treePhotosRepo.find({ where: { plantingUnitId: In(ids) }, order: { createdAt: 'ASC' } }),
      this.plantingUnitsRepo.find({ where: { predecessorUnitId: In(ids) } }),
      predecessorIds.length ? this.plantingUnitsRepo.find({ where: { id: In(predecessorIds) } }) : Promise.resolve([]),
    ]);

    const groupBy = <T>(items: T[], key: (item: T) => string) => {
      const map = new Map<string, T[]>();
      for (const item of items) map.set(key(item), [...(map.get(key(item)) ?? []), item]);
      return map;
    };
    const measurementsByTree = groupBy(measurements, (m) => m.plantingUnitId);
    const photosByTree = groupBy(photos, (p) => p.plantingUnitId);
    const successorByPredecessor = new Map(successors.map((s) => [s.predecessorUnitId as string, s]));
    const predecessorById = new Map(predecessors.map((p) => [p.id, p]));

    return trees.flatMap((tree) =>
      buildTreeEvents(
        tree,
        measurementsByTree.get(tree.id) ?? [],
        photosByTree.get(tree.id) ?? [],
        tree.predecessorUnitId ? predecessorById.get(tree.predecessorUnitId) ?? null : null,
        successorByPredecessor.get(tree.id) ?? null,
      ).map((event) => ({
        plotId: tree.instance.instanceId,
        treeId: tree.treeId,
        species: tree.species?.commonName ?? '',
        currentStatus: tree.status,
        plantingDate: tree.plantingDate,
        ...event,
      })),
    );
  }

  /** Total tree count across all plots (dashboard) */
  count(): Promise<number> {
    return this.plantingUnitsRepo.count();
  }

  /** Every living tree that has its own GPS point, for the GIS map's tree-marker layer. */
  async getMapPoints(): Promise<
    Array<{
      id: string;
      treeId: string;
      speciesName: string;
      gpsLat: number;
      gpsLng: number;
      instanceId: string;
      farmerName: string;
    }>
  > {
    const units = await this.plantingUnitsRepo
      .createQueryBuilder('unit')
      .leftJoinAndSelect('unit.species', 'species')
      .leftJoinAndSelect('unit.instance', 'instance')
      .leftJoinAndSelect('instance.farmer', 'farmer')
      .where('unit.gpsLat IS NOT NULL')
      .andWhere('unit.gpsLng IS NOT NULL')
      .andWhere('unit.lossDate IS NULL')
      .getMany();

    return units.map((u) => ({
      id: u.id,
      treeId: u.treeId,
      speciesName: u.species?.commonName || 'Unknown',
      gpsLat: Number(u.gpsLat),
      gpsLng: Number(u.gpsLng),
      instanceId: u.instance?.instanceId || '',
      farmerName: u.instance?.farmer?.farmerName || '',
    }));
  }
}
