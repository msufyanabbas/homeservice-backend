import { IsString, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProcessRefundDto {
  @ApiProperty()
  @IsUUID()
  bookingId: string;

  @ApiProperty()
  @IsString()
  reason: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;
}