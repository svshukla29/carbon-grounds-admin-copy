import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MonitoringStatus } from '../entities/monitoring-period.entity';

export class UpdateStatusDto {
  @ApiProperty({ enum: MonitoringStatus })
  @IsEnum(MonitoringStatus)
  status: MonitoringStatus;

  @ApiPropertyOptional({ example: 'Looks good, approved.' })
  @IsOptional()
  @IsString()
  adminComments?: string;
}
