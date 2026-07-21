import { PartialType } from '@nestjs/swagger';
import { CreatePlantingUnitDto } from './create-planting-unit.dto';

export class UpdatePlantingUnitDto extends PartialType(CreatePlantingUnitDto) {}
