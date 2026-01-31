import { IsString, Matches, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty()
  @IsString()
  @Matches(/^\+966[0-9]{9}$/)
  phone: string;

  @ApiProperty()
  @IsString()
  @Length(6, 6)
  code: string;

  @ApiProperty()
  @IsString()
  purpose: string;
}