import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MastersController } from './masters.controller';
import { MastersService } from './masters.service';
import { Tribe } from './entities/tribe.entity';
import { IpccConstant } from './entities/ipcc-constant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tribe, IpccConstant])],
  controllers: [MastersController],
  providers: [MastersService],
  exports: [MastersService],
})
export class MastersModule {}
