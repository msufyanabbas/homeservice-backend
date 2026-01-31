import { IsString, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DisputeCategory } from '@common/enums/dispute.enum';

export class CreateDisputeDto {
  @ApiProperty()
  @IsUUID()
  bookingId: string;

  @ApiProperty({ enum: DisputeCategory })
  @IsEnum(DisputeCategory)
  category: DisputeCategory;

  @ApiProperty()
  @IsString()
  description: string;
}