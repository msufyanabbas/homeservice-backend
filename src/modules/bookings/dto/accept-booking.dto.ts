import { IsOptional, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AcceptBookingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedDuration?: number;
}