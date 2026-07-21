import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FarmersController } from './farmers.controller';
import { FarmersService } from './farmers.service';
import { Farmer } from './entities/farmer.entity';
import { GramPanchayat } from '../gram-panchayat/entities/gram-panchayat.entity';
import { CodesModule } from '../codes/codes.module';

@Module({
  imports: [TypeOrmModule.forFeature([Farmer, GramPanchayat]), CodesModule],
  controllers: [FarmersController],
  providers: [FarmersService],
  exports: [FarmersService],
})
export class FarmersModule {}
