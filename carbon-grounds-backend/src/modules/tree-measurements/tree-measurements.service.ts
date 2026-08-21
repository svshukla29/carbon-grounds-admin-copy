import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TreeMeasurement } from './entities/tree-measurement.entity';
import { CreateTreeMeasurementDto } from './dto/create-tree-measurement.dto';
import { PlantingUnitsService } from '../planting-units/planting-units.service';

@Injectable()
export class TreeMeasurementsService {
  constructor(
    @InjectRepository(TreeMeasurement)
    private measurementsRepo: Repository<TreeMeasurement>,
    private plantingUnitsService: PlantingUnitsService,
  ) {}

  async create(dto: CreateTreeMeasurementDto, measuredById?: string): Promise<TreeMeasurement> {
    const measurement = this.measurementsRepo.create({
      plantingUnitId: dto.plantingUnitId,
      heightM: dto.heightM,
      dbhCm: dto.dbhCm,
      healthStatus: dto.healthStatus,
      notes: dto.notes,
      measuredAt: dto.measuredAt ? new Date(dto.measuredAt) : new Date(),
      measuredById,
    });
    const saved = await this.measurementsRepo.save(measurement);

    // Keep the tree's "current" reading in sync with the latest measurement.
    if (dto.heightM != null || dto.dbhCm != null) {
      await this.plantingUnitsService.update(dto.plantingUnitId, {
        ...(dto.heightM != null ? { heightM: dto.heightM } : {}),
        ...(dto.dbhCm != null ? { dbhCm: dto.dbhCm } : {}),
      });
    }

    return saved;
  }

  findByTree(plantingUnitId: string): Promise<TreeMeasurement[]> {
    return this.measurementsRepo.find({
      where: { plantingUnitId },
      order: { measuredAt: 'DESC', createdAt: 'DESC' },
    });
  }
}
