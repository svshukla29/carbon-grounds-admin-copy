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
    const { farmerIds, farmerId, ...projectData } = dto;

    const project = this.projectsRepo.create({
      ...projectData,
      // Default status to Active when creating from the form (no status field)
      status: projectData.status ?? ProjectStatus.ACTIVE,
      farmerId: farmerId ?? undefined,
    });

    // Bulk many-to-many assignment
    if (farmerIds && farmerIds.length > 0) {
      project.farmers = await this.farmersRepo.findBy({ id: In(farmerIds) });
    }

    // Also add primary farmer to M2M if provided
    if (farmerId && !farmerIds?.includes(farmerId)) {
      const primaryFarmer = await this.farmersRepo.findOne({
        where: { id: farmerId },
      });
      if (primaryFarmer) {
        project.farmers = [...(project.farmers || []), primaryFarmer];
      }
    }

    const saved = (await this.projectsRepo.save(project)) as Project;

    // Sync back projectId on the farmer record for quick lookup
    if (farmerId) {
      await this.farmersRepo.update(farmerId, { projectId: saved.id } as any);
    }

    return saved;
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
      .leftJoin('project.farmer', 'primaryFarmer')
      .addSelect(['primaryFarmer.id', 'primaryFarmer.name'])
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
      relations: ['farmers', 'reports', 'farmer'],
    });
    if (!project) throw new NotFoundException(`Project #${id} not found`);
    return project;
  }

  async update(id: string, dto: UpdateProjectDto): Promise<Project> {
    const project = await this.findOne(id);
    const { farmerIds, farmerId, ...updateData } = dto;

    Object.assign(project, updateData);

    // Update primary farmer FK
    if (farmerId !== undefined) {
      project.farmerId = farmerId ?? undefined;
    }

    // Update many-to-many bulk list
    if (farmerIds !== undefined) {
      project.farmers =
        farmerIds.length > 0
          ? await this.farmersRepo.findBy({ id: In(farmerIds) })
          : [];
    }

    const saved = (await this.projectsRepo.save(project)) as Project;

    // Keep farmer.projectId in sync
    if (farmerId) {
      await this.farmersRepo.update(farmerId, { projectId: saved.id } as any);
    }

    return saved;
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
