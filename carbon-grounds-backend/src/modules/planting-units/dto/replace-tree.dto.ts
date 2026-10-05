import {
  IsOptional,
  IsUUID,
  IsNumber,
  IsDateString,
  IsString,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ReplaceTreeDto {
  @ApiPropertyOptional({ description: 'Species of the replacement — defaults to the old tree\'s species if omitted' })
  @IsOptional()
  @IsUUID()
  speciesId?: string;

  @ApiPropertyOptional({ example: 2.5, description: 'Diameter at breast height of the new sapling (cm)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  dbhCm?: number;

  @ApiPropertyOptional({ example: 0.5, description: 'Height of the new sapling (m)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  heightM?: number;

  @ApiPropertyOptional({ example: '2026-03-01' })
  @IsOptional()
  @IsDateString()
  plantingDate?: string;

  @ApiPropertyOptional({ description: 'Defaults to the old tree\'s coordinates if omitted' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  gpsLat?: number;

  @ApiPropertyOptional({ description: 'Defaults to the old tree\'s coordinates if omitted' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  gpsLng?: number;

  @ApiPropertyOptional({ description: 'Why the old tree was replaced (disease, storm damage, etc.)' })
  @IsOptional()
  @IsString()
  reason?: string;
}
