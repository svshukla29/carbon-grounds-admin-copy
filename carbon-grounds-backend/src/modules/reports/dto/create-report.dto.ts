import { IsString, IsOptional, IsEnum, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReportStatus, ReportType } from '../entities/report.entity';

export class CreateReportDto {
  @ApiProperty({ example: 'Q2 2024 Carbon Credits Report' })
  @IsString()
  title: string;

  @ApiProperty({ enum: ReportType })
  @IsEnum(ReportType)
  type: ReportType;

  @ApiPropertyOptional({ enum: ReportStatus })
  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @ApiPropertyOptional({ example: '2024-07-15' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({ example: 'Brief summary of the report...' })
  @IsString()
  summary: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: 'Related Project UUID' })
  @IsOptional()
  @IsUUID()
  projectId?: string;
}
