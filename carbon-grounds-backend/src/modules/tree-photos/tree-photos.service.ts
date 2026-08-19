import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import { join } from 'path';
import { TreePhoto } from './entities/tree-photo.entity';
import { CreateTreePhotoDto } from './dto/create-tree-photo.dto';
import { UpdateTreePhotoDto } from './dto/update-tree-photo.dto';

const UPLOADS_DIR = join(process.cwd(), 'uploads', 'tree-photos');

@Injectable()
export class TreePhotosService {
  constructor(
    @InjectRepository(TreePhoto)
    private treePhotosRepo: Repository<TreePhoto>,
  ) {}

  create(
    dto: CreateTreePhotoDto,
    filename: string,
    originalName: string,
    userId?: string,
  ): Promise<TreePhoto> {
    const photo = this.treePhotosRepo.create({
      plantingUnitId: dto.plantingUnitId,
      monitoringPeriodId: dto.monitoringPeriodId,
      notes: dto.notes,
      takenAt: dto.takenAt ? new Date(dto.takenAt) : new Date(),
      photoUrl: `/tree-photos/files/${filename}`,
      fileName: originalName,
      uploadedById: userId,
    });
    return this.treePhotosRepo.save(photo);
  }

  findByTree(plantingUnitId: string): Promise<TreePhoto[]> {
    return this.treePhotosRepo.find({
      where: { plantingUnitId },
      order: { takenAt: 'DESC', createdAt: 'DESC' },
    });
  }

  findAll(filters?: {
    instanceId?: string;
    speciesId?: string;
    plantingUnitId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: TreePhoto[]; total: number }> {
    const page = filters?.page && filters.page > 0 ? filters.page : 1;
    const limit = filters?.limit && filters.limit > 0 ? filters.limit : 100;

    const qb = this.treePhotosRepo
      .createQueryBuilder('photo')
      .leftJoinAndSelect('photo.plantingUnit', 'unit')
      .leftJoinAndSelect('unit.species', 'species')
      .leftJoinAndSelect('unit.instance', 'instance')
      .orderBy('photo.takenAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (filters?.instanceId) {
      qb.andWhere('unit.instanceId = :instanceId', { instanceId: filters.instanceId });
    }
    if (filters?.speciesId) {
      qb.andWhere('unit.speciesId = :speciesId', { speciesId: filters.speciesId });
    }
    if (filters?.plantingUnitId) {
      qb.andWhere('photo.plantingUnitId = :plantingUnitId', {
        plantingUnitId: filters.plantingUnitId,
      });
    }

    return qb.getManyAndCount().then(([data, total]) => ({ data, total }));
  }

  async findOne(id: string): Promise<TreePhoto> {
    const photo = await this.treePhotosRepo.findOne({
      where: { id },
      relations: ['plantingUnit', 'plantingUnit.species'],
    });
    if (!photo) throw new NotFoundException(`Tree photo #${id} not found`);
    return photo;
  }

  async update(id: string, dto: UpdateTreePhotoDto): Promise<TreePhoto> {
    const photo = await this.findOne(id);
    Object.assign(photo, {
      ...dto,
      takenAt: dto.takenAt ? new Date(dto.takenAt) : photo.takenAt,
    });
    return this.treePhotosRepo.save(photo);
  }

  async remove(id: string): Promise<void> {
    const photo = await this.findOne(id);
    const filePath = join(UPLOADS_DIR, photo.photoUrl.split('/').pop() as string);
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch {
      // file already missing on disk — proceed with removing the DB row
    }
    await this.treePhotosRepo.remove(photo);
  }
}
