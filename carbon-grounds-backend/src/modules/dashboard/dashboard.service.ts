import { Injectable } from '@nestjs/common';
import { FarmersService } from '../farmers/farmers.service';
import { ProjectsService } from '../projects/projects.service';
import { ReportsService } from '../reports/reports.service';
import { TeamsService } from '../teams/teams.service';

@Injectable()
export class DashboardService {
  constructor(
    private farmersService: FarmersService,
    private projectsService: ProjectsService,
    private reportsService: ReportsService,
    private teamsService: TeamsService,
  ) {}

  async getStats() {
    const [
      totalFarmers,
      activeFarmers,   // Verified farmers — "Active Farmers" metric
      totalProjects,
      totalVillages,   // Distinct project locations — "Total Villages" metric
      totalReports,
      totalTeamMembers,
      totalCarbonCredits,
    ] = await Promise.all([
      this.farmersService.count(),
      this.farmersService.countActive(),
      this.projectsService.count(),
      this.projectsService.totalVillages(),
      this.reportsService.count(),
      this.teamsService.count(),
      this.projectsService.totalCarbonCredits(),
    ]);

    return {
      totalFarmers,
      activeFarmers,
      totalProjects,
      totalVillages,
      totalReports,
      totalTeamMembers,
      totalCarbonCredits,
    };
  }
}
