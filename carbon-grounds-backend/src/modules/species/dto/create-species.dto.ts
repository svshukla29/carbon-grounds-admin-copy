import { IsString, IsOptional, IsNumber, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateSpeciesDto {
  @ApiProperty({ example: 'Teak' })
  @IsString()
  commonName: string;

  @ApiProperty({ example: 'Tectona grandis' })
  @IsString()
  scientificName: string;

  @ApiPropertyOptional({ example: 0.65, description: 'Wood density (g/cm3)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  woodDensity?: number;

  @ApiPropertyOptional({
    example: 0.47,
    description: 'Carbon fraction of dry biomass',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  carbonFraction?: number;

  @ApiPropertyOptional({
    example: -2.134,
    description: 'Allometric coefficient a in AGB = exp(a + b*ln(DBH))',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  allometricA?: number;

  @ApiPropertyOptional({
    example: 2.53,
    description: 'Allometric coefficient b in AGB = exp(a + b*ln(DBH))',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  allometricB?: number;

  @ApiPropertyOptional({ example: 40, description: 'Maximum rotation age in years' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxRotationYears?: number;
}
