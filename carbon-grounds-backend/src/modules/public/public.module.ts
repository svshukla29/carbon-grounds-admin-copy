import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';
import { Farmer } from '../farmers/entities/farmer.entity';
import { Instance } from '../instances/entities/instance.entity';
import { PlantingUnit } from '../planting-units/entities/planting-unit.entity';
import { GramPanchayat } from '../gram-panchayat/entities/gram-panchayat.entity';
import { Calculation } from '../calculations/entities/calculation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Farmer, Instance, PlantingUnit, GramPanchayat, Calculation]),
  ],
  controllers: [PublicController],
  providers: [PublicService],
})
export class PublicModule {}
