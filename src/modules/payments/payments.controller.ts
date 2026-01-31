import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Req,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ApiPaginatedResponse } from '@common/decorators/api-paginated-response.decorator';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ProcessRefundDto } from './dto/process-refund.dto';
import { WalletTopUpDto } from './dto/wallet-topup.dto';
import { PaginationDto } from '@common/interfaces/pagination.interface';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Public } from '@common/decorators/public.decorator';
import { UserRole } from '@common/enums/user.enum';
import { User } from '@database/entities/user.entity';
import { Payment } from '@database/entities/payment.entity';
import { Transaction } from '@database/entities/transaction.entity';
import { Refund } from '@database/entities/refund.entity';
import { Request } from 'express';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create payment' })
  @ApiResponse({ status: 201, description: 'Payment initiated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid payment request' })
  async create(
    @CurrentUser() user: User,
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    return this.paymentsService.create(user.id, createPaymentDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user payments' })
  @ApiPaginatedResponse(Payment)
  async findAll(
    @CurrentUser() user: User,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.paymentsService.findAll(user.id, paginationDto);
  }

  @Get('wallet')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get wallet balance' })
  @ApiResponse({ status: 200, description: 'Wallet balance retrieved' })
  async getWallet(@CurrentUser() user: User) {
    return this.paymentsService.getWallet(user.id);
  }

  @Post('wallet/topup')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Top up wallet' })
  @ApiResponse({ status: 200, description: 'Wallet top-up initiated' })
  async topUpWallet(
    @CurrentUser() user: User,
    @Body() walletTopUpDto: WalletTopUpDto,
  ) {
    return this.paymentsService.topUpWallet(user.id, walletTopUpDto);
  }

  @Get('transactions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get transaction history' })
  @ApiPaginatedResponse(Transaction)
  async getTransactions(
    @CurrentUser() user: User,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.paymentsService.getTransactions(user.id, paginationDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({ status: 200, description: 'Payment retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async findOne(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.paymentsService.findOne(user.id, id);
  }

  @Post(':id/verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify payment status' })
  @ApiResponse({ status: 200, description: 'Payment status verified' })
  async verifyPayment(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.paymentsService.verifyPayment(user.id, id);
  }

  // Moyasar webhook endpoint
  @Post('webhooks/moyasar')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Moyasar webhook endpoint' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async moyasarWebhook(
    @Body() payload: any,
    @Headers('X-Moyasar-Signature') signature: string,
  ) {
    return this.paymentsService.handleMoyasarWebhook(payload, signature);
  }

  // STC Pay callback endpoint
  @Post('callbacks/stcpay')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'STC Pay callback endpoint' })
  @ApiResponse({ status: 200, description: 'Callback processed' })
  async stcPayCallback(@Body() payload: any) {
    return this.paymentsService.handleStcPayCallback(payload);
  }

  // Payment callback (success/failure redirects)
  @Get('callback')
  @Public()
  @ApiOperation({ summary: 'Payment callback handler' })
  @ApiResponse({ status: 302, description: 'Redirect to success/failure page' })
  async paymentCallback(@Query() query: any, @Req() req: Request) {
    return this.paymentsService.handlePaymentCallback(query);
  }

  // Refund endpoints
  @Post('refunds')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Request refund' })
  @ApiResponse({ status: 201, description: 'Refund request created' })
  async requestRefund(
    @CurrentUser() user: User,
    @Body() processRefundDto: ProcessRefundDto,
  ) {
    return this.paymentsService.requestRefund(user.id, processRefundDto);
  }

  @Get('refunds')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user refunds' })
  @ApiPaginatedResponse(Refund)
  async getRefunds(
    @CurrentUser() user: User,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.paymentsService.getRefunds(user.id, paginationDto);
  }

  @Get('refunds/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get refund by ID' })
  @ApiResponse({ status: 200, description: 'Refund retrieved' })
  async getRefund(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.paymentsService.getRefund(user.id, id);
  }

  // Admin endpoints
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all payments (Admin only)' })
  @ApiPaginatedResponse(Payment)
  async getAllPayments(@Query() paginationDto: PaginationDto) {
    return this.paymentsService.getAllPayments(paginationDto);
  }

  @Post('refunds/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve refund (Admin only)' })
  @ApiResponse({ status: 200, description: 'Refund approved' })
  async approveRefund(
    @CurrentUser() admin: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.paymentsService.approveRefund(admin.id, id);
  }

  @Post('refunds/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject refund (Admin only)' })
  @ApiResponse({ status: 200, description: 'Refund rejected' })
  async rejectRefund(
    @CurrentUser() admin: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason: string,
  ) {
    return this.paymentsService.rejectRefund(admin.id, id, reason);
  }

  @Get('admin/statistics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get payment statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved' })
  async getStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.paymentsService.getStatistics(startDate, endDate);
  }
}