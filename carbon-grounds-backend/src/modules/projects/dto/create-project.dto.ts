import { IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ example: 'Jashpur Agroforestry Project' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Covers all Gram Panchayats in Manora and Kunkuri blocks' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '2024-01-15' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2029-01-15' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
