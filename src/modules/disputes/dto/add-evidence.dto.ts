import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DisputeEvidenceType } from '@common/enums/dispute.enum';

export class AddEvidenceDto {
  @ApiProperty({ enum: DisputeEvidenceType })
  @IsEnum(DisputeEvidenceType)
  type: DisputeEvidenceType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}