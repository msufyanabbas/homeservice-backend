import { IsString, IsNumber, IsEnum, IsOptional, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentGateway } from '@common/enums/payment.enum';

export class CreatePaymentDto {
  @ApiProperty()
  @IsUUID()
  bookingId: string;

  @ApiProperty({ enum: PaymentGateway })
  @IsEnum(PaymentGateway)
  gateway: PaymentGateway;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;
}