import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Payment } from '@database/entities/payment.entity';
import { Wallet } from '@database/entities/wallet.entity';
import { Transaction } from '@database/entities/transaction.entity';
import { Refund } from '@database/entities/refund.entity';
import { Booking } from '@database/entities/booking.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ProcessRefundDto } from './dto/process-refund.dto';
import { WalletTopUpDto } from './dto/wallet-topup.dto';
import { PaginationDto, createPaginatedResponse } from '@common/interfaces/pagination.interface';
import { PaymentStatus, PaymentGateway, TransactionType, RefundStatus, Currency } from '@common/enums/payment.enum';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Refund)
    private readonly refundRepository: Repository<Refund>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    private readonly configService: ConfigService,
  ) {}

  async create(userId: string, createPaymentDto: CreatePaymentDto) {
    const { bookingId, gateway, amount } = createPaymentDto;

    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId, customerId: userId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const paymentReference = `PAY${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const payment = this.paymentRepository.create({
      paymentReference,
      userId,
      bookingId,
      gateway,
      amount: amount || booking.totalAmount,
      currency: Currency.SAR,
      status: PaymentStatus.PENDING,
    });

    await this.paymentRepository.save(payment);

    // Initiate payment based on gateway
    let paymentUrl: string = ''
    if (gateway === PaymentGateway.MOYASAR) {
      paymentUrl = await this.initiateMoyasarPayment(payment);
    } else if (gateway === PaymentGateway.STC_PAY) {
      paymentUrl = await this.initiateStcPayPayment(payment);
    }

    return {
      paymentId: payment.id,
      paymentReference: payment.paymentReference,
      paymentUrl,
      amount: payment.amount,
    };
  }

  async findAll(userId: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const [payments, total] = await this.paymentRepository.findAndCount({
      where: { userId },
      relations: ['booking'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return createPaginatedResponse(payments, total, page, limit);
  }

  async findOne(userId: string, id: string) {
    const payment = await this.paymentRepository.findOne({
      where: { id, userId },
      relations: ['booking'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async verifyPayment(userId: string, id: string) {
    const payment = await this.paymentRepository.findOne({
      where: { id, userId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Verify with gateway
    if (payment.gateway === PaymentGateway.MOYASAR) {
      return await this.verifyMoyasarPayment(payment);
    } else if (payment.gateway === PaymentGateway.STC_PAY) {
      return await this.verifyStcPayPayment(payment);
    }

    return payment;
  }

  async getWallet(userId: string) {
    let wallet = await this.walletRepository.findOne({ where: { userId } });

    if (!wallet) {
      wallet = this.walletRepository.create({
        userId,
        balance: 0,
      });
      await this.walletRepository.save(wallet);
    }

    return wallet;
  }

  async topUpWallet(userId: string, walletTopUpDto: WalletTopUpDto) {
    const { amount, gateway } = walletTopUpDto;

    const paymentReference = `TOPUP${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const payment = this.paymentRepository.create({
      paymentReference,
      userId,
      gateway,
      amount,
      currency: Currency.SAR,
      status: PaymentStatus.PENDING,
      paymentType: 'WALLET_TOPUP',
    });

    await this.paymentRepository.save(payment);

    let paymentUrl: string = '';
    if (gateway === PaymentGateway.MOYASAR) {
      paymentUrl = await this.initiateMoyasarPayment(payment);
    } else if (gateway === PaymentGateway.STC_PAY) {
      paymentUrl = await this.initiateStcPayPayment(payment);
    }

    return {
      paymentId: payment.id,
      paymentReference: payment.paymentReference,
      paymentUrl,
      amount: payment.amount,
    };
  }

  async getTransactions(userId: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const wallet = await this.walletRepository.findOne({ where: { userId } });
    if (!wallet) {
      return createPaginatedResponse([], 0, page, limit);
    }

    const [transactions, total] = await this.transactionRepository.findAndCount({
      where: { walletId: wallet.id },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return createPaginatedResponse(transactions, total, page, limit);
  }

  async handleMoyasarWebhook(payload: any, signature: string) {
    // TODO: Verify webhook signature
    // TODO: Process webhook event

    const { type, data } = payload;

    if (type === 'payment_paid') {
      await this.markPaymentCompleted(data.id, data);
    } else if (type === 'payment_failed') {
      await this.markPaymentFailed(data.id, data);
    }

    return { received: true };
  }

  async handleStcPayCallback(payload: any) {
    // TODO: Process STC Pay callback
    return { received: true };
  }

  async handlePaymentCallback(query: any) {
    // TODO: Handle payment callback redirect
    return { message: 'Payment processed' };
  }

  async requestRefund(userId: string, processRefundDto: ProcessRefundDto) {
    const { bookingId, reason, amount } = processRefundDto;

    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId, customerId: userId },
      relations: ['payment'],
    });

    if (!booking || !booking.payment) {
      throw new NotFoundException('Booking or payment not found');
    }

    const refundReference = `REF${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const refund = this.refundRepository.create({
      refundReference,
      bookingId,
      paymentId: booking.payment.id,
      userId,
      amount: amount || booking.totalAmount,
      currency: Currency.SAR,
      status: RefundStatus.PENDING,
      reason: reason as any,
      requestedBy: userId,
    });

    await this.refundRepository.save(refund);

    // TODO: Notify admin for approval

    return {
      message: 'Refund request submitted',
      refund,
    };
  }

  async getRefunds(userId: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const [refunds, total] = await this.refundRepository.findAndCount({
      where: { userId },
      relations: ['booking', 'payment'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return createPaginatedResponse(refunds, total, page, limit);
  }

  async getRefund(userId: string, id: string) {
    const refund = await this.refundRepository.findOne({
      where: { id, userId },
      relations: ['booking', 'payment'],
    });

    if (!refund) {
      throw new NotFoundException('Refund not found');
    }

    return refund;
  }

  async getAllPayments(paginationDto: PaginationDto) {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const [payments, total] = await this.paymentRepository.findAndCount({
      relations: ['user', 'booking'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return createPaginatedResponse(payments, total, page, limit);
  }

  async approveRefund(adminId: string, id: string) {
    const refund = await this.refundRepository.findOne({
      where: { id },
      relations: ['payment'],
    });

    if (!refund) {
      throw new NotFoundException('Refund not found');
    }

    refund.status = RefundStatus.APPROVED;
    refund.approvedBy = adminId;
    refund.approvedAt = new Date();

    await this.refundRepository.save(refund);

    // TODO: Process refund to original payment method

    return { message: 'Refund approved' };
  }

  async rejectRefund(adminId: string, id: string, reason: string) {
    const refund = await this.refundRepository.findOne({ where: { id } });

    if (!refund) {
      throw new NotFoundException('Refund not found');
    }

    refund.status = RefundStatus.REJECTED;
    refund.rejectedBy = adminId;
    refund.rejectedAt = new Date();
    refund.rejectionReason = reason;

    await this.refundRepository.save(refund);

    return { message: 'Refund rejected' };
  }

  async getStatistics(startDate?: string, endDate?: string) {
    // TODO: Implement payment statistics
    return {
      totalRevenue: 0,
      totalTransactions: 0,
      successfulPayments: 0,
      failedPayments: 0,
      pendingRefunds: 0,
    };
  }

  // Private helper methods
  private async initiateMoyasarPayment(payment: Payment): Promise<string> {
    // TODO: Implement Moyasar payment initiation
    return 'https://moyasar.com/payment/...';
  }

  private async initiateStcPayPayment(payment: Payment): Promise<string> {
    // TODO: Implement STC Pay payment initiation
    return 'stcpay://payment/...';
  }

  private async verifyMoyasarPayment(payment: Payment) {
    // TODO: Verify payment with Moyasar API
    return payment;
  }

  private async verifyStcPayPayment(payment: Payment) {
    // TODO: Verify payment with STC Pay API
    return payment;
  }

  private async markPaymentCompleted(paymentId: string, data: any) {
    const payment = await this.paymentRepository.findOne({ where: { gatewayPaymentId: paymentId } });
    if (payment) {
      payment.status = PaymentStatus.COMPLETED;
      payment.paidAt = new Date();
      payment.gatewayResponse = data;
      await this.paymentRepository.save(payment);

      // Update wallet if topup
      if (payment.paymentType === 'WALLET_TOPUP') {
        const wallet = await this.walletRepository.findOne({ where: { userId: payment.userId } });
        if (wallet) {
          wallet.balance += payment.amount;
          await this.walletRepository.save(wallet);
        }
      }
    }
  }

  private async markPaymentFailed(paymentId: string, data: any) {
    const payment = await this.paymentRepository.findOne({ where: { gatewayPaymentId: paymentId } });
    if (payment) {
      payment.status = PaymentStatus.FAILED;
      payment.failedAt = new Date();
      payment.gatewayResponse = data;
      await this.paymentRepository.save(payment);
    }
  }
}