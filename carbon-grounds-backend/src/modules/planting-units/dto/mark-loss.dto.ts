import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum LossStatus {
  DEAD = 'DEAD',
  LOST = 'LOST',
}

export class MarkLossDto {
  @ApiProperty({ example: '2026-03-01' })
  @IsDateString()
  lossDate: string;

  @ApiPropertyOptional({ enum: LossStatus, default: LossStatus.LOST })
  @IsOptional()
  @IsEnum(LossStatus)
  status?: LossStatus;

  @ApiPropertyOptional({ description: 'Why the tree died/was lost' })
  @IsOptional()
  @IsString()
  reason?: string;
}
