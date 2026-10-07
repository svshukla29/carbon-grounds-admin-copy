import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { Project } from './entities/project.entity';
import { GramPanchayatModule } from '../gram-panchayat/gram-panchayat.module';
import { PlantingUnitsModule } from '../planting-units/planting-units.module';

@Module({
  imports: [TypeOrmModule.forFeature([Project]), GramPanchayatModule, PlantingUnitsModule],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
