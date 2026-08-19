import { Module } from '@nestjs/common';
import { InstancesModule } from '../instances/instances.module';
import { PlantingUnitsModule } from '../planting-units/planting-units.module';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';

@Module({
  imports: [InstancesModule, PlantingUnitsModule],
  controllers: [SyncController],
  providers: [SyncService],
})
export class SyncModule {}
