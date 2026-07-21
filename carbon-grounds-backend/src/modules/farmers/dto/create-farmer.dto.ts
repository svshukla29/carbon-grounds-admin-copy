import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsUUID,
  Length,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender, FarmerCategory } from '../entities/farmer.entity';

const emptyToUndefined = ({ value }: { value: unknown }) =>
  value === '' ? undefined : value;

export class CreateFarmerDto {
  @ApiProperty({ example: 'Ramesh Kumar' })
  @IsString()
  farmerName: string;

  @ApiProperty({ enum: Gender })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ example: '9876543210' })
  @IsString()
  @Length(10, 15)
  mobileNo: string;

  @ApiProperty({ enum: FarmerCategory })
  @IsEnum(FarmerCategory)
  category: FarmerCategory;

  @ApiPropertyOptional({ description: 'Tribe UUID (required when category = ST)' })
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsUUID()
  tribeId?: string;

  @ApiPropertyOptional({ default: false, description: 'Below Poverty Line' })
  @IsOptional()
  @IsBoolean()
  bpl?: boolean;

  @ApiPropertyOptional({ description: 'Gram Panchayat UUID' })
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsUUID()
  gramPanchayatId?: string;

  @ApiProperty({ example: 'Kondagaon' })
  @IsString()
  villageName: string;

  @ApiPropertyOptional({ example: '123456' })
  @IsOptional()
  @IsString()
  villageLgdCode?: string;

  @ApiPropertyOptional({ example: 'Kondagaon Block' })
  @IsOptional()
  @IsString()
  block?: string;

  @ApiPropertyOptional({ example: 'Kondagaon Tehsil' })
  @IsOptional()
  @IsString()
  tehsil?: string;

  @ApiProperty({ example: 'Bastar' })
  @IsString()
  district: string;

  @ApiPropertyOptional({ example: 'Chhattisgarh', default: 'Chhattisgarh' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ example: '494226' })
  @IsOptional()
  @IsString()
  pinCode?: string;

  @ApiProperty({ example: 'Khasra No. 123/4' })
  @IsString()
  khasraNo: string;
}
