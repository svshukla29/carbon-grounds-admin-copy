import { Type } from 'class-transformer';
import { IsArray, IsUUID, ValidateNested } from 'class-validator';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { CreateKyariBedDto } from './create-kyari-bed.dto';

export class BulkKyariBedItemDto extends OmitType(CreateKyariBedDto, [
  'instanceId',
] as const) {}

export class BulkCreateKyariBedsDto {
  @ApiProperty({ description: 'Farm plot (Instance) UUID shared by all beds' })
  @IsUUID()
  instanceId: string;

  @ApiProperty({ type: [BulkKyariBedItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkKyariBedItemDto)
  beds: BulkKyariBedItemDto[];
}
