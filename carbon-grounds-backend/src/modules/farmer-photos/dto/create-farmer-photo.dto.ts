import { IsString, IsOptional, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFarmerPhotoDto {
  @ApiProperty({ description: 'Farmer UUID this photo belongs to' })
  @IsUUID()
  farmerId: string;

  @ApiPropertyOptional({ example: '2026-06-12', description: 'Date the photo was taken; defaults to today' })
  @IsOptional()
  @IsDateString()
  takenAt?: string;
}
