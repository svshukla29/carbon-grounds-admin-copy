import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report, ReportStatus } from './entities/report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private reportsRepo: Repository<Report>,
  ) {}

  async create(dto: CreateReportDto, userId: string): Promise<Report> {
    const report = this.reportsRepo.create({ ...dto, createdById: userId });
    return this.reportsRepo.save(report);
  }

  async findAll(query?: { search?: string; status?: ReportStatus; projectId?: string }): Promise<Report[]> {
    const qb = this.reportsRepo
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.project', 'project')
      .leftJoinAndSelect('report.createdBy', 'user')
      .orderBy('report.createdAt', 'DESC');

    if (query?.search) {
      qb.andWhere('report.title ILIKE :s', { s: `%${query.search}%` });
    }
    if (query?.status) {
      qb.andWhere('report.status = :status', { status: query.status });
    }
    if (query?.projectId) {
      qb.andWhere('report.projectId = :projectId', { projectId: query.projectId });
    }

    return qb.getMany();
  }

  async findOne(id: string): Promise<Report> {
    const report = await this.reportsRepo.findOne({
      where: { id },
      relations: ['project', 'createdBy'],
    });
    if (!report) throw new NotFoundException(`Report #${id} not found`);
    return report;
  }

  async update(id: string, dto: UpdateReportDto): Promise<Report> {
    const report = await this.findOne(id);
    Object.assign(report, dto);
    return this.reportsRepo.save(report);
  }

  async attachFile(id: string, fileUrl: string, fileName: string): Promise<Report> {
    const report = await this.findOne(id);
    report.fileUrl = fileUrl;
    report.fileName = fileName;
    return this.reportsRepo.save(report);
  }

  async remove(id: string): Promise<{ message: string }> {
    const report = await this.findOne(id);
    await this.reportsRepo.remove(report);
    return { message: 'Report deleted successfully' };
  }

  async count(): Promise<number> {
    return this.reportsRepo.count();
  }
}
