import { IsString, IsOptional, IsUUID, IsNumber, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTreeMeasurementDto {
  @ApiProperty({ description: 'Planting unit (tree) UUID this measurement belongs to' })
  @IsUUID()
  plantingUnitId: string;

  @ApiPropertyOptional({ example: 3.4 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  heightM?: number;

  @ApiPropertyOptional({ example: 9.2 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  dbhCm?: number;

  @ApiPropertyOptional({ example: 'HEALTHY', description: 'HEALTHY, DISEASED, or AVERAGE' })
  @IsOptional()
  @IsString()
  healthStatus?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: '2026-08-21', description: 'Defaults to today' })
  @IsOptional()
  @IsDateString()
  measuredAt?: string;
}
