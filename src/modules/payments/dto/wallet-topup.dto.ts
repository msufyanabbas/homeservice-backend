import { IsNumber, IsEnum, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentGateway } from '@common/enums/payment.enum';

export class WalletTopUpDto {
  @ApiProperty()
  @IsNumber()
  @Min(10)
  amount: number;

  @ApiProperty({ enum: PaymentGateway })
  @IsEnum(PaymentGateway)
  gateway: PaymentGateway;
}