import { IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MarkLossDto {
  @ApiProperty({ example: '2026-03-01' })
  @IsDateString()
  lossDate: string;
}
