import { IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLocationDto {
  @ApiPropertyOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  accuracy?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  speed?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  heading?: number;
}