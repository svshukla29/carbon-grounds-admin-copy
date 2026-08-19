import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateCropAreaDto } from './create-crop-area.dto';

export class UpdateCropAreaDto extends PartialType(
  OmitType(CreateCropAreaDto, ['instanceId'] as const),
) {}
