import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TreePhotosController } from './tree-photos.controller';
import { TreePhotosService } from './tree-photos.service';
import { TreePhoto } from './entities/tree-photo.entity';
import { PlantingUnitsModule } from '../planting-units/planting-units.module';

@Module({
  imports: [TypeOrmModule.forFeature([TreePhoto]), PlantingUnitsModule],
  controllers: [TreePhotosController],
  providers: [TreePhotosService],
  exports: [TreePhotosService],
})
export class TreePhotosModule {}
