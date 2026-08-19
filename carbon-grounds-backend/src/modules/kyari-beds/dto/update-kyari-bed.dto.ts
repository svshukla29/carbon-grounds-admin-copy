import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateKyariBedDto } from './create-kyari-bed.dto';

export class UpdateKyariBedDto extends PartialType(
  OmitType(CreateKyariBedDto, ['instanceId'] as const),
) {}
