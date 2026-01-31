import { IsString, Matches, MinLength, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
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
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  newPassword: string;
}