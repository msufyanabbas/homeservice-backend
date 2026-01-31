import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SearchNearbyDto {
  @ApiProperty()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  radius?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;
}