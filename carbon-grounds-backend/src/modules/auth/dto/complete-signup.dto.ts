import {
  IsString,
  MinLength,
  IsOptional,
  Length,
  IsNumber,
  IsEnum,
  IsBoolean,
  IsUUID,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender, FarmerCategory } from '../../farmers/entities/farmer.entity';

const emptyToUndefined = ({ value }: { value: unknown }) =>
  value === '' ? undefined : value;

export class CompleteSignupDto {
  @ApiProperty({ description: 'Short-lived token returned by verify-otp when the mobile number is not yet registered' })
  @IsString()
  signupToken: string;

  // ── Page 1 ────────────────────────────────────────────────────────────
  @ApiProperty({ example: 'Ishwari Yadav' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiPropertyOptional({ enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ enum: FarmerCategory })
  @IsOptional()
  @IsEnum(FarmerCategory)
  category?: FarmerCategory;

  @ApiPropertyOptional({ description: 'Tribe UUID (required when category = ST)' })
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsUUID()
  tribeId?: string;

  @ApiPropertyOptional({ default: false, description: 'Below Poverty Line' })
  @IsOptional()
  @IsBoolean()
  bpl?: boolean;

  @ApiPropertyOptional({ example: '123456789012' })
  @IsOptional()
  @Transform(emptyToUndefined)
  @Length(12, 12)
  @IsString()
  aadhaarNumber?: string;

  // ── Page 2 ────────────────────────────────────────────────────────────
  @ApiPropertyOptional({ example: 'Chhattisgarh', default: 'Chhattisgarh' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ example: 'Jashpur' })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({ example: '496001' })
  @IsOptional()
  @IsString()
  pinCode?: string;

  @ApiPropertyOptional({ example: 'Kunkuri' })
  @IsOptional()
  @IsString()
  block?: string;

  @ApiPropertyOptional({ example: 'Kunkuri' })
  @IsOptional()
  @IsString()
  tehsil?: string;

  @ApiProperty({ example: 'Bhilaigarh' })
  @IsString()
  @MinLength(2)
  village: string;

  @ApiPropertyOptional({ example: '123456' })
  @IsOptional()
  @IsString()
  villageLgdCode?: string;

  // ── Page 3 ────────────────────────────────────────────────────────────
  @ApiPropertyOptional({ example: 'Khasra No. 123/4' })
  @IsOptional()
  @IsString()
  khasraNo?: string;

  @ApiPropertyOptional({ example: 22.1234 })
  @IsOptional()
  @IsNumber()
  gpsLat?: number;

  @ApiPropertyOptional({ example: 84.1234 })
  @IsOptional()
  @IsNumber()
  gpsLng?: number;
}
