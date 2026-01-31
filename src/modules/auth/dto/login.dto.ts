import { IsString, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: '+966501234567' })
  @IsString()
  @Matches(/^\+966[0-9]{9}$/)
  phone: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password: string;
}