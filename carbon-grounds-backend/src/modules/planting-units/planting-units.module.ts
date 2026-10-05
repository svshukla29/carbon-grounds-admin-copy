import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlantingUnitsController } from './planting-units.controller';
import { PlantingUnitsService } from './planting-units.service';
import { PlantingUnit } from './entities/planting-unit.entity';
import { Instance } from '../instances/entities/instance.entity';
import { TreeMeasurement } from '../tree-measurements/entities/tree-measurement.entity';
import { TreePhoto } from '../tree-photos/entities/tree-photo.entity';
import { CodesModule } from '../codes/codes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlantingUnit, Instance, TreeMeasurement, TreePhoto]),
    CodesModule,
  ],
  controllers: [PlantingUnitsController],
  providers: [PlantingUnitsService],
  exports: [PlantingUnitsService],
})
export class PlantingUnitsModule {}
