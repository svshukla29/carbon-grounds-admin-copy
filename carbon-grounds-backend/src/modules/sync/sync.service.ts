import { Injectable } from '@nestjs/common';
import { InstancesService } from '../instances/instances.service';
import { PlantingUnitsService } from '../planting-units/planting-units.service';
import { SyncBatchDto } from './dto/sync-batch.dto';

export interface SyncError {
  clientId: string;
  type: 'instance' | 'plantingUnit';
  message: string;
}

@Injectable()
export class SyncService {
  constructor(
    private instancesService: InstancesService,
    private plantingUnitsService: PlantingUnitsService,
  ) {}

  /**
   * Pushes a batch of offline-collected plots + trees for one farmer.
   * Plots are created first so plantingUnits in the same batch can reference
   * a plot via its local clientId instead of waiting for a prior round-trip.
   */
  async syncBatch(farmerId: string, dto: SyncBatchDto) {
    const instanceIdMap: Record<string, string> = {};
    const errors: SyncError[] = [];
    let createdInstances = 0;
    let createdPlantingUnits = 0;

    for (const item of dto.instances ?? []) {
      try {
        const instance = await this.instancesService.create({
          farmerId,
          areaAcres: item.areaAcres,
          irrigationType: item.irrigationType,
          monitoringFrequency: item.monitoringFrequency,
          boundaryGeojson: item.boundaryGeojson,
          gpsLat: item.gpsLat,
          gpsLng: item.gpsLng,
        });
        instanceIdMap[item.clientId] = instance.id;
        createdInstances++;
      } catch (e) {
        errors.push({
          clientId: item.clientId,
          type: 'instance',
          message: e instanceof Error ? e.message : 'Failed to create plot',
        });
      }
    }

    for (const item of dto.plantingUnits ?? []) {
      const instanceId = instanceIdMap[item.clientInstanceId] ?? item.clientInstanceId;
      try {
        await this.plantingUnitsService.create(
          {
            instanceId,
            speciesId: item.speciesId,
            dbhCm: item.dbhCm,
            heightM: item.heightM,
            plantingDate: item.plantingDate,
            gpsLat: item.gpsLat,
            gpsLng: item.gpsLng,
          },
          farmerId,
        );
        createdPlantingUnits++;
      } catch (e) {
        errors.push({
          clientId: item.clientInstanceId,
          type: 'plantingUnit',
          message: e instanceof Error ? e.message : 'Failed to create tree',
        });
      }
    }

    return {
      success: errors.length === 0,
      instanceIdMap,
      createdInstances,
      createdPlantingUnits,
      errors,
    };
  }
}
