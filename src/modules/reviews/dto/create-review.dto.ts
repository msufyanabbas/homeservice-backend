import { IsString, IsNumber, IsOptional, IsUUID, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty()
  @IsUUID()
  bookingId: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(5)
  overallRating: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(5)
  qualityRating: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(5)
  professionalismRating: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(5)
  punctualityRating: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  commentAr?: string;
}