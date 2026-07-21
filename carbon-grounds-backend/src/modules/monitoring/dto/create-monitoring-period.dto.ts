import { IsString, IsOptional, IsUUID, IsInt, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateMonitoringPeriodDto {
  @ApiProperty({ description: 'Farm plot (Instance) UUID' })
  @IsUUID()
  instanceId: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  periodNumber?: number;

  @ApiPropertyOptional({ example: 'Year 1 Monitoring' })
  @IsOptional()
  @IsString()
  periodName?: string;

  @ApiPropertyOptional({ example: '2026-01-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
