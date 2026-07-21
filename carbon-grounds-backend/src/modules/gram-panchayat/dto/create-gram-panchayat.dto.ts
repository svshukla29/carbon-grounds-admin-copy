import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGramPanchayatDto {
  @ApiProperty({ example: 'Kondagaon' })
  @IsString()
  gpName: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  lgdCode: string;

  @ApiProperty({ example: 'Chhattisgarh', enum: ['Chhattisgarh', 'Uttarakhand'] })
  @IsIn(['Chhattisgarh', 'Uttarakhand'])
  state: string;

  @ApiProperty({ example: 'Bastar' })
  @IsString()
  district: string;

  @ApiPropertyOptional({ example: 'Kondagaon Block' })
  @IsOptional()
  @IsString()
  block?: string;

  @ApiPropertyOptional({ example: 'Ramesh Sahu' })
  @IsOptional()
  @IsString()
  sachivName?: string;

  @ApiPropertyOptional({ example: '+91 98765 43210' })
  @IsOptional()
  @IsString()
  sachivPhone?: string;

  @ApiPropertyOptional({ example: 'Suresh Verma' })
  @IsOptional()
  @IsString()
  contact1Name?: string;

  @ApiPropertyOptional({ example: '+91 98765 43211' })
  @IsOptional()
  @IsString()
  contact1Phone?: string;
}
