import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, ProjectStatus } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepo: Repository<Project>,
  ) {}

  async create(dto: CreateProjectDto): Promise<Project> {
    const project = this.projectsRepo.create({
      ...dto,
      // Default status to Active when creating from the form (no status field)
      status: dto.status ?? ProjectStatus.ACTIVE,
    });
    return this.projectsRepo.save(project);
  }

  async findAll(query?: {
    search?: string;
    status?: ProjectStatus;
    type?: string;
  }): Promise<Project[]> {
    const qb = this.projectsRepo
      .createQueryBuilder('project')
      .orderBy('project.createdAt', 'DESC');

    if (query?.search) {
      qb.andWhere(
        '(project.name ILIKE :search OR project.location ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }
    if (query?.status) {
      qb.andWhere('project.status = :status', { status: query.status });
    }
    if (query?.type) {
      qb.andWhere('project.type = :type', { type: query.type });
    }

    return qb.getMany();
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectsRepo.findOne({
      where: { id },
      relations: ['reports'],
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

  async count(): Promise<number> {
    return this.projectsRepo.count();
  }

  async totalCarbonCredits(): Promise<number> {
    const result = await this.projectsRepo
      .createQueryBuilder('project')
      .select('SUM(project.carbonCredits)', 'total')
      .getRawOne();
    return parseFloat(result?.total || 0);
  }

  /**
   * Count distinct villages (unique locations) across all projects.
   * Uses location as a proxy for village.
   */
  async totalVillages(): Promise<number> {
    const result = await this.projectsRepo
      .createQueryBuilder('project')
      .select('COUNT(DISTINCT project.location)', 'total')
      .getRawOne();
    return parseInt(result?.total || '0', 10);
  }
}
