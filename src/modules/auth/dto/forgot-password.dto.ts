import { IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty()
  @IsString()
  @Matches(/^\+966[0-9]{9}$/)
  phone: string;
}