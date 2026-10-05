import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FarmerPhotosController } from './farmer-photos.controller';
import { FarmerPhotosService } from './farmer-photos.service';
import { FarmerPhoto } from './entities/farmer-photo.entity';
import { Farmer } from '../farmers/entities/farmer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FarmerPhoto, Farmer])],
  controllers: [FarmerPhotosController],
  providers: [FarmerPhotosService],
  exports: [FarmerPhotosService],
})
export class FarmerPhotosModule {}
