import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class CreateEcologicalZoneDto {
  @ApiProperty({ example: 'Tropical Moist Deciduous' })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiPropertyOptional({ example: 'Tropical', description: 'IPCC climate domain' })
  @IsOptional()
  @IsString()
  @Length(0, 20)
  domain?: string;

  @ApiProperty({ example: 0.24, description: 'Root:shoot ratio (R) used by the carbon calculation' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(9.99)
  rootShootRatio: number;

  @ApiPropertyOptional({ example: 'IPCC 2006 GL Table 4.4 — Tropical moist deciduous forest' })
  @IsOptional()
  @IsString()
  source?: string;
}

export class UpdateEcologicalZoneDto extends PartialType(CreateEcologicalZoneDto) {
  @ApiPropertyOptional({ description: 'Inactive zones are hidden from forms; plots already using them keep their link' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
