import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MastersController } from './masters.controller';
import { MastersService } from './masters.service';
import { Tribe } from './entities/tribe.entity';
import { IpccConstant } from './entities/ipcc-constant.entity';
import { EcologicalZone } from './entities/ecological-zone.entity';
import { Instance } from '../instances/entities/instance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tribe, IpccConstant, EcologicalZone, Instance])],
  controllers: [MastersController],
  providers: [MastersService],
  exports: [MastersService],
})
export class MastersModule {}
