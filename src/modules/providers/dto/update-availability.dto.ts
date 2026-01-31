import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProviderAvailability } from '@common/enums/provider.enum';

export class UpdateAvailabilityDto {
  @ApiProperty({ enum: ProviderAvailability })
  @IsEnum(ProviderAvailability)
  availability: ProviderAvailability;
}