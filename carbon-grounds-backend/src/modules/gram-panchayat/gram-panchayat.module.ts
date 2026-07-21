import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GramPanchayatController } from './gram-panchayat.controller';
import { GramPanchayatService } from './gram-panchayat.service';
import { GramPanchayat } from './entities/gram-panchayat.entity';
import { CodesModule } from '../codes/codes.module';

@Module({
  imports: [TypeOrmModule.forFeature([GramPanchayat]), CodesModule],
  controllers: [GramPanchayatController],
  providers: [GramPanchayatService],
  exports: [GramPanchayatService],
})
export class GramPanchayatModule {}
