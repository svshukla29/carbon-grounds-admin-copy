import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RetireCalculationDto {
  @ApiPropertyOptional({ example: 'Sold to XYZ Corp as part of Q1 offset purchase' })
  @IsOptional()
  @IsString()
  reason?: string;
}
