import { IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty({ example: '9876543210' })
  @IsString()
  @Length(10, 10)
  @Matches(/^[0-9]{10}$/, { message: 'mobile must be a 10-digit number' })
  mobile: string;
}
