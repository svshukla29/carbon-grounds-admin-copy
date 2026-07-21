import { PartialType } from '@nestjs/swagger';
import { CreateGramPanchayatDto } from './create-gram-panchayat.dto';

export class UpdateGramPanchayatDto extends PartialType(CreateGramPanchayatDto) {}
