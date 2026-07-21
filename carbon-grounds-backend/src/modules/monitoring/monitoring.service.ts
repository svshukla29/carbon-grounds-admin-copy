import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  MonitoringPeriod,
  MonitoringStatus,
} from './entities/monitoring-period.entity';
import { CreateMonitoringPeriodDto } from './dto/create-monitoring-period.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Injectable()
export class MonitoringService {
  constructor(
    @InjectRepository(MonitoringPeriod)
    private monitoringRepo: Repository<MonitoringPeriod>,
  ) {}

  create(dto: CreateMonitoringPeriodDto): Promise<MonitoringPeriod> {
    return this.monitoringRepo.save(this.monitoringRepo.create(dto));
  }

  findAll(query?: {
    instanceId?: string;
    status?: MonitoringStatus;
  }): Promise<MonitoringPeriod[]> {
    const where: Record<string, any> = {};
    if (query?.instanceId) where.instanceId = query.instanceId;
    if (query?.status) where.status = query.status;
    return this.monitoringRepo.find({
      where,
      relations: ['instance'],
      order: { createdAt: 'DESC' },
    });
  }

  getPending(): Promise<MonitoringPeriod[]> {
    return this.monitoringRepo.find({
      where: { status: In([MonitoringStatus.SUBMITTED, MonitoringStatus.UNDER_REVIEW]) },
      relations: ['instance'],
      order: { submittedAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<MonitoringPeriod> {
    const period = await this.monitoringRepo.findOne({
      where: { id },
      relations: ['instance'],
    });
    if (!period) throw new NotFoundException(`Monitoring period #${id} not found`);
    return period;
  }

  async updateStatus(id: string, dto: UpdateStatusDto): Promise<MonitoringPeriod> {
    const period = await this.findOne(id);
    period.status = dto.status;
    if (dto.adminComments !== undefined) period.adminComments = dto.adminComments;
    if (dto.status === MonitoringStatus.SUBMITTED && !period.submittedAt) {
      period.submittedAt = new Date();
    }
    return this.monitoringRepo.save(period);
  }

  /** Total monitoring periods recorded (dashboard "Monitoring Visits") */
  count(): Promise<number> {
    return this.monitoringRepo.count();
  }
}
