import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from '@database/entities/user.entity';
import { Otp } from '@database/entities/otp.entity';
import { Wallet } from '@database/entities/wallet.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserStatus, UserRole } from '@common/enums/user.enum';
import { JwtPayload } from '@common/interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Otp)
    private readonly otpRepository: Repository<Otp>,
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { phone, email, password, firstName, lastName, firstNameAr, lastNameAr, role } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: [{ phone }, ...(email ? [{ email }] : [])],
    });

    if (existingUser) {
      throw new ConflictException('User with this phone or email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = this.userRepository.create({
      phone,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      firstNameAr,
      lastNameAr,
      role: role || UserRole.CUSTOMER,
      status: UserStatus.PENDING_VERIFICATION,
      phoneVerified: false,
      emailVerified: false,
    });

    await this.userRepository.save(user);

    // Create wallet for user
    const wallet = this.walletRepository.create({
      userId: user.id,
      balance: 0,
    });
    await this.walletRepository.save(wallet);

    // Generate and send OTP
    await this.generateAndSendOtp(phone, 'REGISTRATION');

    return {
      message: 'Registration successful. Please verify your phone number.',
      userId: user.id,
      phone,
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const { phone, code, purpose } = verifyOtpDto;

    // Find OTP
    const otp = await this.otpRepository.findOne({
      where: {
        phone,
        code,
        purpose,
        isUsed: false,
        isBlocked: false,
      },
      order: { createdAt: 'DESC' },
    });

    if (!otp) {
      throw new BadRequestException('Invalid OTP code');
    }

    // Check if expired
    if (new Date() > otp.expiresAt) {
      throw new BadRequestException('OTP has expired');
    }

    // Check attempts
    if (otp.attemptCount >= otp.maxAttempts) {
      otp.isBlocked = true;
      await this.otpRepository.save(otp);
      throw new BadRequestException('Maximum OTP attempts exceeded');
    }

    // Mark OTP as used
    otp.isUsed = true;
    otp.usedAt = new Date();
    await this.otpRepository.save(otp);

    // Find and update user
    const user = await this.userRepository.findOne({ where: { phone } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.phoneVerified = true;
    user.status = UserStatus.ACTIVE;
    user.lastLoginAt = new Date();
    user.loginCount = (user.loginCount || 0) + 1;

    await this.userRepository.save(user);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      message: 'Phone verified successfully',
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async resendOtp(resendOtpDto: ResendOtpDto) {
    const { phone, purpose } = resendOtpDto;

    // Check if user exists
    const user = await this.userRepository.findOne({ where: { phone } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check for recent OTP (cooldown period)
    const recentOtp = await this.otpRepository.findOne({
      where: { phone, purpose },
      order: { createdAt: 'DESC' },
    });

    if (recentOtp) {
      const cooldownMs = 2 * 60 * 1000; // 2 minutes
      const timeSinceLastOtp = Date.now() - recentOtp.createdAt.getTime();
      
      if (timeSinceLastOtp < cooldownMs) {
        const remainingSeconds = Math.ceil((cooldownMs - timeSinceLastOtp) / 1000);
        throw new BadRequestException(
          `Please wait ${remainingSeconds} seconds before requesting a new OTP`,
        );
      }
    }

    await this.generateAndSendOtp(phone, purpose);

    return {
      message: 'OTP sent successfully',
      phone,
    };
  }

  async login(loginDto: LoginDto) {
    const { phone, password } = loginDto;

    // Find user
    const user = await this.userRepository.findOne({ 
      where: { phone },
      select: ['id', 'phone', 'email', 'password', 'role', 'status', 'phoneVerified'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if phone is verified
    if (!user.phoneVerified) {
      throw new UnauthorizedException('Please verify your phone number first');
    }

    // Check user status
    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException('Your account has been suspended');
    }

    if (user.status === UserStatus.BANNED) {
      throw new UnauthorizedException('Your account has been banned');
    }

    // Update last login
    user.lastLoginAt = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    await this.userRepository.save(user);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      message: 'Login successful',
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { phone } = forgotPasswordDto;

    // Check if user exists
    const user = await this.userRepository.findOne({ where: { phone } });
    if (!user) {
      // Don't reveal if user exists or not
      return {
        message: 'If the phone number exists, an OTP has been sent',
        phone,
      };
    }

    await this.generateAndSendOtp(phone, 'FORGOT_PASSWORD');

    return {
      message: 'OTP sent successfully',
      phone,
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { phone, code, newPassword } = resetPasswordDto;

    // Verify OTP
    const otp = await this.otpRepository.findOne({
      where: {
        phone,
        code,
        purpose: 'FORGOT_PASSWORD',
        isUsed: false,
      },
      order: { createdAt: 'DESC' },
    });

    if (!otp || new Date() > otp.expiresAt) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Mark OTP as used
    otp.isUsed = true;
    otp.usedAt = new Date();
    await this.otpRepository.save(otp);

    // Find and update user password
    const user = await this.userRepository.findOne({ where: { phone } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await this.userRepository.save(user);

    return {
      message: 'Password reset successfully',
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;

    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('jwt.refreshSecret'),
      });

      const user = await this.userRepository.findOne({ where: { id: payload.sub } });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const tokens = await this.generateTokens(user);

      return {
        message: 'Token refreshed successfully',
        ...tokens,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    // In a more sophisticated setup, you might invalidate refresh tokens here
    // For now, we'll just return a success message
    return {
      message: 'Logout successful',
    };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword } = changePasswordDto;

    const user = await this.userRepository.findOne({ 
      where: { id: userId },
      select: ['id', 'password'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash and save new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await this.userRepository.save(user);

    return {
      message: 'Password changed successfully',
    };
  }

  async getCurrentUser(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user);
  }

  async updateFcmToken(userId: string, fcmToken: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Add FCM token to array if not already present
    const fcmTokens = user.fcmTokens || [];
    if (!fcmTokens.includes(fcmToken)) {
      fcmTokens.push(fcmToken);
      user.fcmTokens = fcmTokens;
      await this.userRepository.save(user);
    }

    return {
      message: 'FCM token updated successfully',
    };
  }

  async removeFcmToken(userId: string, fcmToken: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Remove FCM token from array
    const fcmTokens = user.fcmTokens || [];
    user.fcmTokens = fcmTokens.filter(token => token !== fcmToken);
    await this.userRepository.save(user);

    return {
      message: 'FCM token removed successfully',
    };
  }

  // Helper methods
  private async generateAndSendOtp(phone: string, purpose: string) {
    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Create OTP record
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes expiry

    const otp = this.otpRepository.create({
      phone,
      code,
      purpose,
      expiresAt,
      maxAttempts: 3,
    });

    await this.otpRepository.save(otp);

    // TODO: Send SMS via Twilio or other SMS service
    console.log(`OTP for ${phone}: ${code}`); // For development only

    return otp;
  }

  private async generateTokens(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      phone: user.phone,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('jwt.secret'),
      expiresIn: this.configService.get('jwt.accessExpiration'),
    });

    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      {
        secret: this.configService.get('jwt.refreshSecret'),
        expiresIn: this.configService.get('jwt.refreshExpiration'),
      },
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
    };
  }

  private sanitizeUser(user: User) {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}