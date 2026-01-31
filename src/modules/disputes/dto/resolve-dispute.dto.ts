import { IsString, IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DisputeResolution } from '@common/enums/dispute.enum';

export class ResolveDisputeDto {
  @ApiProperty({ enum: DisputeResolution })
  @IsEnum(DisputeResolution)
  resolution: DisputeResolution;

  @ApiProperty()
  @IsString()
  notes: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  refundAmount?: number;
}