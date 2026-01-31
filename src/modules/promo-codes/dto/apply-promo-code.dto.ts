import { IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApplyPromoCodeDto {
  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  bookingAmount: number;
}