import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
}
