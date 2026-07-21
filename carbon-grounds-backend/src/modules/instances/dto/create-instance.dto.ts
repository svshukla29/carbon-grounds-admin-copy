import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsUUID,
  IsNumber,
  IsDateString,
  IsObject,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { MonitoringFrequency } from '../entities/instance.entity';

export class CreateInstanceDto {
  @ApiProperty({ description: 'Farmer UUID this plot belongs to' })
  @IsUUID()
  farmerId: string;

  @ApiProperty({ example: 2.5, description: 'Plot area in acres' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  areaAcres: number;

  @ApiPropertyOptional({ example: 'Agricultural Land' })
  @IsOptional()
  @IsString()
  landUseType?: string;

  @ApiPropertyOptional({ example: 'Tropical Dry Deciduous' })
  @IsOptional()
  @IsString()
  ecologicalZone?: string;

  @ApiPropertyOptional({ example: '2026-01-15' })
  @IsOptional()
  @IsDateString()
  surveyDate?: string;

  @ApiPropertyOptional({ example: 'Rainfed', default: 'Rainfed' })
  @IsOptional()
  @IsString()
  irrigationType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  powerAvailability?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  internetAvailability?: boolean;

  @ApiPropertyOptional({ enum: MonitoringFrequency, default: MonitoringFrequency.ANNUAL })
  @IsOptional()
  @IsEnum(MonitoringFrequency)
  monitoringFrequency?: MonitoringFrequency;

  @ApiPropertyOptional({ description: 'GeoJSON Polygon/MultiPolygon boundary' })
  @IsOptional()
  @IsObject()
  boundaryGeojson?: Record<string, any>;

  @ApiPropertyOptional({ example: 21.2787 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  gpsLat?: number;

  @ApiPropertyOptional({ example: 81.8661 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  gpsLng?: number;
}
