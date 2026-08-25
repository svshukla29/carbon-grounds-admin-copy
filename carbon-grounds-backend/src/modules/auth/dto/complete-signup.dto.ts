import { IsString, MinLength, IsOptional, Length, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CompleteSignupDto {
  @ApiProperty({ description: 'Short-lived token returned by verify-otp when the mobile number is not yet registered' })
  @IsString()
  signupToken: string;

  @ApiProperty({ example: 'Ishwari Yadav' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'Bhilaigarh' })
  @IsString()
  @MinLength(2)
  village: string;

  @ApiPropertyOptional({ example: '123456789012' })
  @IsOptional()
  @IsString()
  @Length(12, 12)
  aadhaarNumber?: string;

  @ApiPropertyOptional({ example: 22.1234 })
  @IsOptional()
  @IsNumber()
  gpsLat?: number;

  @ApiPropertyOptional({ example: 84.1234 })
  @IsOptional()
  @IsNumber()
  gpsLng?: number;
}
