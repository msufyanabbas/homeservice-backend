import { IsOptional, IsString, IsEnum, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ProviderStatus, ProviderAvailability } from '@common/enums/provider.enum';

export class ProviderFilterDto {
  @ApiPropertyOptional({ enum: ProviderStatus })
  @IsOptional()
  @IsEnum(ProviderStatus)
  status?: ProviderStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ enum: ProviderAvailability })
  @IsOptional()
  @IsEnum(ProviderAvailability)
  availability?: ProviderAvailability;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minRating?: number;
}