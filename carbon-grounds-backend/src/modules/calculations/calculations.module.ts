import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalculationsController } from './calculations.controller';
import { CalculationsService } from './calculations.service';
import { Calculation } from './entities/calculation.entity';
import { Instance } from '../instances/entities/instance.entity';
import { MonitoringPeriod } from '../monitoring/entities/monitoring-period.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Calculation, Instance, MonitoringPeriod])],
  controllers: [CalculationsController],
  providers: [CalculationsService],
  exports: [CalculationsService],
})
export class CalculationsModule {}
