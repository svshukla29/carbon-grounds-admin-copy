import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CropAreasController } from './crop-areas.controller';
import { CropAreasService } from './crop-areas.service';
import { CropArea } from './entities/crop-area.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CropArea])],
  controllers: [CropAreasController],
  providers: [CropAreasService],
  exports: [CropAreasService],
})
export class CropAreasModule {}
