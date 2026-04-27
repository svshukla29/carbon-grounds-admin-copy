import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { FarmersModule } from '../farmers/farmers.module';
import { ProjectsModule } from '../projects/projects.module';
import { PartnersModule } from '../partners/partners.module';
import { ReportsModule } from '../reports/reports.module';
import { TeamsModule } from '../teams/teams.module';

@Module({
  imports: [FarmersModule, ProjectsModule, PartnersModule, ReportsModule, TeamsModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
