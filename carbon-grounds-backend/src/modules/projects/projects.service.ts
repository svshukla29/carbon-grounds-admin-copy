import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { GramPanchayatService } from '../gram-panchayat/gram-panchayat.service';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepo: Repository<Project>,
    private gramPanchayatService: GramPanchayatService,
  ) {}

  create(dto: CreateProjectDto): Promise<Project> {
    return this.projectsRepo.save(this.projectsRepo.create(dto));
  }

  findAll(search?: string): Promise<Project[]> {
    const qb = this.projectsRepo.createQueryBuilder('project').orderBy('project.createdAt', 'DESC');
    if (search) qb.andWhere('project.name ILIKE :search', { search: `%${search}%` });
    return qb.getMany();
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectsRepo.findOne({
      where: { id },
      relations: ['gramPanchayats'],
    });
    if (!project) throw new NotFoundException(`Project #${id} not found`);
    return project;
  }

  async update(id: string, dto: UpdateProjectDto): Promise<Project> {
    const project = await this.findOne(id);
    Object.assign(project, dto);
    return this.projectsRepo.save(project);
  }

  async remove(id: string): Promise<{ message: string }> {
    const project = await this.findOne(id);
    await this.projectsRepo.remove(project);
    return { message: 'Project deleted successfully' };
  }

  count(): Promise<number> {
    return this.projectsRepo.count();
  }

  /**
   * Rolls up every Gram Panchayat under this Project into one set of totals
   * — same shape as GramPanchayatService.getSummary(), just summed across
   * every GP that belongs to the project instead of one.
   */
  async getSummary(id: string): Promise<{
    gramPanchayatCount: number;
    farmerCount: number;
    totalPlots: number;
    totalAreaAcres: number;
    totalTrees: number;
    totalNetCredits: number;
    verifiedNetCredits: number;
    pendingNetCredits: number;
  }> {
    const project = await this.findOne(id);
    const gpSummaries = await Promise.all(
      project.gramPanchayats.map((gp) => this.gramPanchayatService.getSummary(gp.id)),
    );

    return gpSummaries.reduce<{
      gramPanchayatCount: number;
      farmerCount: number;
      totalPlots: number;
      totalAreaAcres: number;
      totalTrees: number;
      totalNetCredits: number;
      verifiedNetCredits: number;
      pendingNetCredits: number;
    }>(
      (acc, s) => ({
        gramPanchayatCount: acc.gramPanchayatCount + 1,
        farmerCount: acc.farmerCount + s.farmerCount,
        totalPlots: acc.totalPlots + s.totalPlots,
        totalAreaAcres: acc.totalAreaAcres + s.totalAreaAcres,
        totalTrees: acc.totalTrees + s.totalTrees,
        totalNetCredits: acc.totalNetCredits + s.totalNetCredits,
        verifiedNetCredits: acc.verifiedNetCredits + s.verifiedNetCredits,
        pendingNetCredits: acc.pendingNetCredits + s.pendingNetCredits,
      }),
      {
        gramPanchayatCount: 0,
        farmerCount: 0,
        totalPlots: 0,
        totalAreaAcres: 0,
        totalTrees: 0,
        totalNetCredits: 0,
        verifiedNetCredits: 0,
        pendingNetCredits: 0,
      },
    );
  }

  /** Data backing the Project-wise Excel report: project details, the
   * rolled-up summary, and a per-GP breakdown row for each GP in it. */
  async getReportData(id: string): Promise<{
    project: Project;
    summary: Awaited<ReturnType<ProjectsService['getSummary']>>;
    gramPanchayats: Array<{ gp: string; lgdCode: string; district: string } & Record<string, any>>;
  }> {
    const project = await this.findOne(id);
    const summary = await this.getSummary(id);
    const gramPanchayats = await Promise.all(
      project.gramPanchayats.map(async (gp) => ({
        gp: gp.gpName,
        lgdCode: gp.lgdCode,
        district: gp.district,
        ...(await this.gramPanchayatService.getSummary(gp.id)),
      })),
    );
    return { project, summary, gramPanchayats };
  }
}
