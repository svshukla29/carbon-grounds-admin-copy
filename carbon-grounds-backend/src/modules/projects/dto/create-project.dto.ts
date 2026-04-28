import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  IsArray,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ProjectStatus,
  ProjectType,
  LandType,
  SoilType,
  WaterSource,
} from '../entities/project.entity';

export class CreateProjectDto {
  @ApiProperty({
    example: 'PRJ-001',
    description: 'Unique project identifier / display name',
  })
  @IsString()
  name: string;

  @ApiProperty({ enum: ProjectType })
  @IsEnum(ProjectType)
  type: ProjectType;

  @ApiProperty({ example: 'Nashik, Maharashtra' })
  @IsString()
  location: string;

  @ApiPropertyOptional({ example: 450 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  carbonCredits?: number;

  /** Status defaults to Active and is managed by the system */
  @ApiPropertyOptional({ enum: ProjectStatus })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiPropertyOptional({ example: '2024-01-15' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2025-01-15' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: 'Project description...' })
  @IsOptional()
  @IsString()
  description?: string;

  // ─── Land Details ──────────────────────────────────────────────────────────

  @ApiPropertyOptional({ example: 25.5, description: 'Land area in hectares' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  landArea?: number;

  @ApiPropertyOptional({ enum: LandType })
  @IsOptional()
  @IsEnum(LandType)
  landType?: LandType;

  @ApiPropertyOptional({ enum: SoilType })
  @IsOptional()
  @IsEnum(SoilType)
  soilType?: SoilType;

  @ApiPropertyOptional({ enum: WaterSource })
  @IsOptional()
  @IsEnum(WaterSource)
  waterSource?: WaterSource;

  @ApiPropertyOptional({
    example: 340,
    description: 'Elevation in metres above sea level',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  elevation?: number;

  @ApiPropertyOptional({ example: '10.7645° N, 106.7019° E' })
  @IsOptional()
  @IsString()
  coordinates?: string;

  // ─── Farmer Assignment ─────────────────────────────────────────────────────

  @ApiPropertyOptional({
    description: 'UUID of the primary farmer assigned to this project',
  })
  @IsOptional()
  @IsUUID()
  farmerId?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Array of Farmer UUIDs (bulk assignment)',
  })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  farmerIds?: string[];
}
