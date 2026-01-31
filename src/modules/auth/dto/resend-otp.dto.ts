import { IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResendOtpDto {
  @ApiProperty()
  @IsString()
  @Matches(/^\+966[0-9]{9}$/)
  phone: string;

  @ApiProperty()
  @IsString()
  purpose: string;
}