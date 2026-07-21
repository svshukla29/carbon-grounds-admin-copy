import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdCounter } from './entities/id-counter.entity';
import { DistrictCode } from './entities/district-code.entity';
import { IdSequenceService } from './id-sequence.service';
import { DistrictCodeService } from './district-code.service';

@Module({
  imports: [TypeOrmModule.forFeature([IdCounter, DistrictCode])],
  providers: [IdSequenceService, DistrictCodeService],
  exports: [IdSequenceService, DistrictCodeService],
})
export class CodesModule {}
