import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReviewResponseDto {
  @ApiProperty()
  @IsString()
  response: string;
}