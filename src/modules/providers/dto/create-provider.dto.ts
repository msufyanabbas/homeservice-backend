import { IsString, IsArray, IsOptional, Matches, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProviderDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsString()
  @Matches(/^[0-9]{10}$/, { message: 'Iqama must be 10 digits' })
  iqamaNumber: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  serviceCategories: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  serviceAreas?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  businessName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  businessNameAr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bioAr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  experienceYears?: number;
}