import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Project, ProjectStatus } from './entities/project.entity';
import { Farmer } from '../farmers/entities/farmer.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepo: Repository<Project>,
    @InjectRepository(Farmer)
    private farmersRepo: Repository<Farmer>,
  ) {}

  async create(dto: CreateProjectDto): Promise<Project> {
    const { farmerIds, ...projectData } = dto;

    const project = this.projectsRepo.create(projectData);

    if (farmerIds && farmerIds.length > 0) {
      project.farmers = await this.farmersRepo.findBy({ id: In(farmerIds) });
    }

    return this.projectsRepo.save(project);
  }

  async findAll(query?: {
    search?: string;
    status?: ProjectStatus;
    type?: string;
  }): Promise<Project[]> {
    const qb = this.projectsRepo
      .createQueryBuilder('project')
      .leftJoin('project.farmers', 'farmer')
      .addSelect(['farmer.id', 'farmer.name'])
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
      relations: ['farmers', 'reports'],
    });
    if (!project) throw new NotFoundException(`Project #${id} not found`);
    return project;
  }

  async update(id: string, dto: UpdateProjectDto): Promise<Project> {
    const project = await this.findOne(id);
    const { farmerIds, ...updateData } = dto;

    Object.assign(project, updateData);

    if (farmerIds !== undefined) {
      project.farmers =
        farmerIds.length > 0
          ? await this.farmersRepo.findBy({ id: In(farmerIds) })
          : [];
    }

    return this.projectsRepo.save(project);
  }

  async assignFarmers(
    projectId: string,
    farmerIds: string[],
  ): Promise<Project> {
    const project = await this.findOne(projectId);
    const farmers = await this.farmersRepo.findBy({ id: In(farmerIds) });
    project.farmers = [...(project.farmers || []), ...farmers];
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
}
