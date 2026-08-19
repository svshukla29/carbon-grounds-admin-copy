import { IsString, IsOptional, IsUUID, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateCropAreaDto {
  @ApiProperty({ description: 'Farm plot (Instance) UUID this crop area belongs to' })
  @IsUUID()
  instanceId: string;

  @ApiPropertyOptional({ example: 'Turmeric' })
  @IsOptional()
  @IsString()
  cropName?: string;

  @ApiProperty({ example: 0.5, description: 'Crop area in acres' })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  areaAcres: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
