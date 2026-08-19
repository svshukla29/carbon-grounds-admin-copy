import { IsString, IsOptional, IsUUID, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateKyariBedDto {
  @ApiProperty({ description: 'Farm plot (Instance) UUID this bed belongs to' })
  @IsUUID()
  instanceId: string;

  @ApiPropertyOptional({ example: 'Bed 1' })
  @IsOptional()
  @IsString()
  bedLabel?: string;

  @ApiProperty({ example: 0.25, description: 'Kyari (bed) area in acres' })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  areaAcres: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
