import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { FarmersModule } from '../farmers/farmers.module';
import { InstancesModule } from '../instances/instances.module';
import { PlantingUnitsModule } from '../planting-units/planting-units.module';
import { GramPanchayatModule } from '../gram-panchayat/gram-panchayat.module';
import { SpeciesModule } from '../species/species.module';
import { CalculationsModule } from '../calculations/calculations.module';
import { MonitoringModule } from '../monitoring/monitoring.module';

@Module({
  imports: [
    FarmersModule,
    InstancesModule,
    PlantingUnitsModule,
    GramPanchayatModule,
    SpeciesModule,
    CalculationsModule,
    MonitoringModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
