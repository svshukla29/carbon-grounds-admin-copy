import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TreeMeasurementsController } from './tree-measurements.controller';
import { TreeMeasurementsService } from './tree-measurements.service';
import { TreeMeasurement } from './entities/tree-measurement.entity';
import { PlantingUnitsModule } from '../planting-units/planting-units.module';

@Module({
  imports: [TypeOrmModule.forFeature([TreeMeasurement]), PlantingUnitsModule],
  controllers: [TreeMeasurementsController],
  providers: [TreeMeasurementsService],
  exports: [TreeMeasurementsService],
})
export class TreeMeasurementsModule {}
