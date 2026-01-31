import { IsString, IsNumber, IsEnum, IsOptional, IsBoolean, IsDateString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePromoCodeDto {
  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsEnum(['PERCENTAGE', 'FIXED'])
  discountType: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  discountValue: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscountAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderAmount?: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  maxUsage: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  maxUsagePerUser?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}