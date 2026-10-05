import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstancesController } from './instances.controller';
import { InstancesService } from './instances.service';
import { Instance } from './entities/instance.entity';
import { Farmer } from '../farmers/entities/farmer.entity';
import { PlantingUnit } from '../planting-units/entities/planting-unit.entity';
import { Calculation } from '../calculations/entities/calculation.entity';
import { CodesModule } from '../codes/codes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Instance, Farmer, PlantingUnit, Calculation]),
    CodesModule,
  ],
  controllers: [InstancesController],
  providers: [InstancesService],
  exports: [InstancesService],
})
export class InstancesModule {}
