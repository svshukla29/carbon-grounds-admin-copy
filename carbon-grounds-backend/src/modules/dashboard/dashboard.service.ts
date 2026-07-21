import { Injectable } from '@nestjs/common';
import { FarmersService } from '../farmers/farmers.service';
import { InstancesService } from '../instances/instances.service';
import { PlantingUnitsService } from '../planting-units/planting-units.service';
import { GramPanchayatService } from '../gram-panchayat/gram-panchayat.service';
import { SpeciesService } from '../species/species.service';
import { CalculationsService } from '../calculations/calculations.service';
import { MonitoringService } from '../monitoring/monitoring.service';

@Injectable()
export class DashboardService {
  constructor(
    private farmersService: FarmersService,
    private instancesService: InstancesService,
    private plantingUnitsService: PlantingUnitsService,
    private gramPanchayatService: GramPanchayatService,
    private speciesService: SpeciesService,
    private calculationsService: CalculationsService,
    private monitoringService: MonitoringService,
  ) {}

  async getStats() {
    const [
      totalFarmers,
      totalInstances,
      totalTrees,
      totalGramPanchayats,
      totalSpecies,
      totalCarbonCredits,
      totalReports,
    ] = await Promise.all([
      this.farmersService.count(),
      this.instancesService.count(),
      this.plantingUnitsService.count(),
      this.gramPanchayatService.count(),
      this.speciesService.count(),
      this.calculationsService.totalNetCredits(),
      this.monitoringService.count(),
    ]);

    return {
      totalFarmers,
      totalInstances,
      totalTrees,
      totalGramPanchayats,
      totalSpecies,
      totalCarbonCredits,
      totalReports,
    };
  }
}
