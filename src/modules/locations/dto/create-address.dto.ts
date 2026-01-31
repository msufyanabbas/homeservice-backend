import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiProperty()
  @IsString()
  label: string;

  @ApiProperty()
  @IsString()
  fullAddress: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  street?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  building?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  floor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  apartment?: string;

  @ApiProperty()
  @IsString()
  city: string;

  @ApiProperty()
  @IsString()
  district: string;

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
  @IsString()
  notes?: string;
}