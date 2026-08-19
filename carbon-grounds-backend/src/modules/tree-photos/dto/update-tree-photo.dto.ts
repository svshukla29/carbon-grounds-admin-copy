import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateTreePhotoDto } from './create-tree-photo.dto';

export class UpdateTreePhotoDto extends PartialType(
  OmitType(CreateTreePhotoDto, ['plantingUnitId'] as const),
) {}
