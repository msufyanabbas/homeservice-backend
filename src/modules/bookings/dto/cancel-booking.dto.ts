import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CancelBookingDto {
  @ApiProperty()
  @IsString()
  reason: string;
}