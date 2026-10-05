import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalculationsController } from './calculations.controller';
import { CalculationsService } from './calculations.service';
import { Calculation } from './entities/calculation.entity';
import { CalculationDetail } from './entities/calculation-detail.entity';
import { Instance } from '../instances/entities/instance.entity';
import { MonitoringPeriod } from '../monitoring/entities/monitoring-period.entity';
import { IpccConstant } from '../masters/entities/ipcc-constant.entity';
import { InstancesModule } from '../instances/instances.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Calculation, CalculationDetail, Instance, MonitoringPeriod, IpccConstant]),
    InstancesModule,
  ],
  controllers: [CalculationsController],
  providers: [CalculationsService],
  exports: [CalculationsService],
})
export class CalculationsModule {}
