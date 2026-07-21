import { Type } from 'class-transformer';
import { IsArray, IsUUID, ValidateNested } from 'class-validator';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { CreatePlantingUnitDto } from './create-planting-unit.dto';

export class BulkPlantingUnitItemDto extends OmitType(CreatePlantingUnitDto, [
  'instanceId',
] as const) {}

export class BulkCreatePlantingUnitsDto {
  @ApiProperty({ description: 'Farm plot (Instance) UUID shared by all units' })
  @IsUUID()
  instanceId: string;

  @ApiProperty({ type: [BulkPlantingUnitItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkPlantingUnitItemDto)
  units: BulkPlantingUnitItemDto[];
}
