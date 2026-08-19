import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CropArea } from './entities/crop-area.entity';
import { CreateCropAreaDto } from './dto/create-crop-area.dto';
import { UpdateCropAreaDto } from './dto/update-crop-area.dto';
import { BulkCreateCropAreasDto } from './dto/bulk-create-crop-areas.dto';

@Injectable()
export class CropAreasService {
  constructor(
    @InjectRepository(CropArea)
    private cropAreasRepo: Repository<CropArea>,
  ) {}

  create(dto: CreateCropAreaDto): Promise<CropArea> {
    return this.cropAreasRepo.save(this.cropAreasRepo.create(dto));
  }

  bulkCreate(dto: BulkCreateCropAreasDto): Promise<CropArea[]> {
    const areas = dto.areas.map((area) =>
      this.cropAreasRepo.create({ ...area, instanceId: dto.instanceId }),
    );
    return this.cropAreasRepo.save(areas);
  }

  findByInstance(instanceId: string): Promise<CropArea[]> {
    return this.cropAreasRepo.find({
      where: { instanceId },
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<CropArea> {
    const area = await this.cropAreasRepo.findOne({ where: { id } });
    if (!area) throw new NotFoundException(`Crop area #${id} not found`);
    return area;
  }

  async update(id: string, dto: UpdateCropAreaDto): Promise<CropArea> {
    const area = await this.findOne(id);
    Object.assign(area, dto);
    return this.cropAreasRepo.save(area);
  }

  async remove(id: string): Promise<void> {
    const area = await this.findOne(id);
    await this.cropAreasRepo.remove(area);
  }

  /** Total crop area record count across all plots (dashboard) */
  count(): Promise<number> {
    return this.cropAreasRepo.count();
  }

  /** Sum of all crop areas (dashboard) */
  async totalAreaAcres(): Promise<number> {
    const { total } = await this.cropAreasRepo
      .createQueryBuilder('area')
      .select('COALESCE(SUM(area.areaAcres), 0)', 'total')
      .getRawOne();
    return parseFloat(total);
  }
}
