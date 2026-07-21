import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlantingUnitsController } from './planting-units.controller';
import { PlantingUnitsService } from './planting-units.service';
import { PlantingUnit } from './entities/planting-unit.entity';
import { Instance } from '../instances/entities/instance.entity';
import { CodesModule } from '../codes/codes.module';

@Module({
  imports: [TypeOrmModule.forFeature([PlantingUnit, Instance]), CodesModule],
  controllers: [PlantingUnitsController],
  providers: [PlantingUnitsService],
  exports: [PlantingUnitsService],
})
export class PlantingUnitsModule {}
