import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Public } from '@common/decorators/public.decorator';
import { User } from '@database/entities/user.entity';
import { RateLimit, RateLimitGuard } from '@/common/guards/rate-limit.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  // @RateLimit({ limit: 5, ttl: 3600 }) // 5 requests per hour
  @UseGuards(RateLimitGuard)
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully. OTP sent.' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP and complete registration' })
  @ApiResponse({ status: 200, description: 'OTP verified. User authenticated.' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto);
  }

  @Public()
  @Post('resend-otp')
  @RateLimit({ limit: 3, ttl: 120, message: 'Too many OTP requests' }) // 3 per 2 minutes
  @UseGuards(RateLimitGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend OTP' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  @ApiResponse({ status: 429, description: 'Too many requests. Please wait.' })
  async resendOtp(@Body() resendOtpDto: ResendOtpDto) {
    return this.authService.resendOtp(resendOtpDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with phone and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 403, description: 'Account suspended or banned' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset OTP' })
  @ApiResponse({ status: 200, description: 'Password reset OTP sent' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with OTP' })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Public()
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(@CurrentUser() user: User) {
    return this.authService.logout(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Patch('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Current password is incorrect' })
  async changePassword(
    @CurrentUser() user: User,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.id, changePasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  async getCurrentUser(@CurrentUser() user: User) {
    return this.authService.getCurrentUser(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Post('update-fcm-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update FCM token for push notifications' })
  @ApiResponse({ status: 200, description: 'FCM token updated' })
  async updateFcmToken(
    @CurrentUser() user: User,
    @Body('fcmToken') fcmToken: string,
  ) {
    return this.authService.updateFcmToken(user.id, fcmToken);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Post('remove-fcm-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove FCM token' })
  @ApiResponse({ status: 200, description: 'FCM token removed' })
  async removeFcmToken(
    @CurrentUser() user: User,
    @Body('fcmToken') fcmToken: string,
  ) {
    return this.authService.removeFcmToken(user.id, fcmToken);
  }
}