import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FarmerPhoto } from './entities/farmer-photo.entity';
import { CreateFarmerPhotoDto } from './dto/create-farmer-photo.dto';
import { Farmer } from '../farmers/entities/farmer.entity';

@Injectable()
export class FarmerPhotosService {
  constructor(
    @InjectRepository(FarmerPhoto)
    private farmerPhotosRepo: Repository<FarmerPhoto>,
    @InjectRepository(Farmer)
    private farmersRepo: Repository<Farmer>,
  ) {}

  async create(
    dto: CreateFarmerPhotoDto,
    filename: string,
    originalName: string,
    userId?: string,
  ): Promise<FarmerPhoto> {
    const photoUrl = `/farmer-photos/files/${filename}`;
    const photo = this.farmerPhotosRepo.create({
      farmerId: dto.farmerId,
      takenAt: dto.takenAt ? new Date(dto.takenAt) : new Date(),
      photoUrl,
      fileName: originalName,
      uploadedById: userId,
    });
    const saved = await this.farmerPhotosRepo.save(photo);
    await this.farmersRepo.update(dto.farmerId, { photoUrl });
    return saved;
  }

  findByFarmer(farmerId: string): Promise<FarmerPhoto[]> {
    return this.farmerPhotosRepo.find({
      where: { farmerId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<FarmerPhoto> {
    const photo = await this.farmerPhotosRepo.findOne({ where: { id } });
    if (!photo) throw new NotFoundException(`Farmer photo #${id} not found`);
    return photo;
  }
}
