import {
  IsOptional,
  IsUUID,
  IsNumber,
  IsDateString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatePlantingUnitDto {
  @ApiProperty({ description: 'Farm plot (Instance) UUID' })
  @IsUUID()
  instanceId: string;

  @ApiProperty({ description: 'Species UUID' })
  @IsUUID()
  speciesId: string;

  @ApiPropertyOptional({ example: 12.5, description: 'Diameter at breast height (cm)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  dbhCm?: number;

  @ApiPropertyOptional({ example: 4.2, description: 'Height (m)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  heightM?: number;

  @ApiPropertyOptional({ example: '2024-07-01' })
  @IsOptional()
  @IsDateString()
  plantingDate?: string;

  @ApiPropertyOptional({ example: 21.2787 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  gpsLat?: number;

  @ApiPropertyOptional({ example: 81.8661 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  gpsLng?: number;
}
