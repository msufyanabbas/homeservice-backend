import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DisputeMessageDto {
  @ApiProperty()
  @IsString()
  message: string;
}