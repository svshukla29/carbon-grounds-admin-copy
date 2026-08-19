import { Type } from 'class-transformer';
import { IsArray, IsUUID, ValidateNested } from 'class-validator';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { CreateCropAreaDto } from './create-crop-area.dto';

export class BulkCropAreaItemDto extends OmitType(CreateCropAreaDto, [
  'instanceId',
] as const) {}

export class BulkCreateCropAreasDto {
  @ApiProperty({ description: 'Farm plot (Instance) UUID shared by all crop areas' })
  @IsUUID()
  instanceId: string;

  @ApiProperty({ type: [BulkCropAreaItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkCropAreaItemDto)
  areas: BulkCropAreaItemDto[];
}
