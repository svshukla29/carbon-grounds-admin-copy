import { Injectable } from '@nestjs/common';
import { FarmersService } from '../farmers/farmers.service';
import { ProjectsService } from '../projects/projects.service';
import { PartnersService } from '../partners/partners.service';
import { ReportsService } from '../reports/reports.service';
import { TeamsService } from '../teams/teams.service';

@Injectable()
export class DashboardService {
  constructor(
    private farmersService: FarmersService,
    private projectsService: ProjectsService,
    private partnersService: PartnersService,
    private reportsService: ReportsService,
    private teamsService: TeamsService,
  ) {}

  async getStats() {
    const [
      totalFarmers,
      totalProjects,
      totalPartners,
      totalReports,
      totalTeamMembers,
      totalCarbonCredits,
    ] = await Promise.all([
      this.farmersService.count(),
      this.projectsService.count(),
      this.partnersService.count(),
      this.reportsService.count(),
      this.teamsService.count(),
      this.projectsService.totalCarbonCredits(),
    ]);

    return {
      totalFarmers,
      totalProjects,
      totalPartners,
      totalReports,
      totalTeamMembers,
      totalCarbonCredits,
    };
  }
}
