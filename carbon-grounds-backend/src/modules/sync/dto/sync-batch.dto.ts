import {
  IsArray,
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  IsDateString,
  IsObject,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { MonitoringFrequency } from '../../instances/entities/instance.entity';

export class SyncInstanceDto {
  @ApiPropertyOptional({ description: 'Local (offline) id the app generated for this plot — echoed back in the response so the app can reconcile it with the real server id' })
  @IsString()
  clientId: string;

  @ApiPropertyOptional({ example: 2.5, description: 'Plot area in acres' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  areaAcres: number;

  @ApiPropertyOptional({ example: 'Rainfed', default: 'Rainfed' })
  @IsOptional()
  @IsString()
  irrigationType?: string;

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

export class SyncPlantingUnitDto {
  @ApiPropertyOptional({ description: 'Either the clientId of a plot in the same batch, or the real UUID of an already-synced plot' })
  @IsString()
  clientInstanceId: string;

  @ApiPropertyOptional({ description: 'Species UUID' })
  @IsUUID()
  speciesId: string;

  @ApiPropertyOptional({ example: 12.5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  dbhCm?: number;

  @ApiPropertyOptional({ example: 4.2 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  heightM?: number;

  @ApiPropertyOptional({ example: '2024-07-01' })
  @IsOptional()
  @IsDateString()
  plantingDate?: string;

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

export class SyncBatchDto {
  @ApiPropertyOptional({ type: [SyncInstanceDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncInstanceDto)
  instances?: SyncInstanceDto[];

  @ApiPropertyOptional({ type: [SyncPlantingUnitDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncPlantingUnitDto)
  plantingUnits?: SyncPlantingUnitDto[];
}
