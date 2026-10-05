import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { Project } from './entities/project.entity';
import { GramPanchayatModule } from '../gram-panchayat/gram-panchayat.module';

@Module({
  imports: [TypeOrmModule.forFeature([Project]), GramPanchayatModule],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
