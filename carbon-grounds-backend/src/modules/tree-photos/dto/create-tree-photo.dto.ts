import { IsString, IsOptional, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTreePhotoDto {
  @ApiProperty({ description: 'Planting unit (tree) UUID this photo belongs to' })
  @IsUUID()
  plantingUnitId: string;

  @ApiPropertyOptional({ example: '2026-06-12', description: 'Date the photo was taken; defaults to today' })
  @IsOptional()
  @IsDateString()
  takenAt?: string;

  @ApiPropertyOptional({ description: 'Monitoring period UUID this photo was captured during' })
  @IsOptional()
  @IsUUID()
  monitoringPeriodId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
