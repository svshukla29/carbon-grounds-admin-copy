import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GramPanchayatController } from './gram-panchayat.controller';
import { GramPanchayatService } from './gram-panchayat.service';
import { GramPanchayat } from './entities/gram-panchayat.entity';
import { Instance } from '../instances/entities/instance.entity';
import { PlantingUnit } from '../planting-units/entities/planting-unit.entity';
import { Calculation } from '../calculations/entities/calculation.entity';
import { CodesModule } from '../codes/codes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GramPanchayat, Instance, PlantingUnit, Calculation]),
    CodesModule,
  ],
  controllers: [GramPanchayatController],
  providers: [GramPanchayatService],
  exports: [GramPanchayatService],
})
export class GramPanchayatModule {}
