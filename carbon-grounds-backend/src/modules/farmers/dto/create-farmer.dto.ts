import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsArray,
  IsDateString,
  IsEmail,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { FarmerStatus } from '../entities/farmer.entity';

export class CreateFarmerDto {
  @ApiProperty({ example: 'Ramesh Kumar' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Experienced farmer from Maharashtra' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ example: 'Nashik, Maharashtra' })
  @IsString()
  location: string;

  @ApiProperty({ example: 2.5, description: 'Farm area in hectares' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  area: number;

  @ApiPropertyOptional({ example: ['Rice', 'Wheat'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  crops?: string[];

  @ApiPropertyOptional({ example: ['Organic Farming'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[];

  @ApiPropertyOptional({ enum: FarmerStatus })
  @IsOptional()
  @IsEnum(FarmerStatus)
  status?: FarmerStatus;

  @ApiPropertyOptional({ example: '2024-01-15' })
  @IsOptional()
  @IsDateString()
  joinDate?: string;

  @ApiPropertyOptional({ example: '+91 98765 43210' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'ramesh@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'Village Road, Nashik' })
  @IsOptional()
  @IsString()
  address?: string;
}
