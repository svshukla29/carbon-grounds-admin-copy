import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BulkChecklistItemDto {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty()
  @IsBoolean()
  completed: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remarks?: string;
}

export class BulkUpdateChecklistDto {
  @ApiProperty({ type: [BulkChecklistItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkChecklistItemDto)
  items: BulkChecklistItemDto[];
}
