import { IsString, IsDateString, IsOptional, IsObject, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty()
  @IsUUID()
  serviceId: string;

  @ApiProperty()
  @IsDateString()
  scheduledDate: string;

  @ApiProperty()
  @IsString()
  scheduledTime: string;

  @ApiProperty()
  @IsObject()
  address: object;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  promoCode?: string;
}