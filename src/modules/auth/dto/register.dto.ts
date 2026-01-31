import { IsString, IsEmail, IsOptional, MinLength, Matches, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@common/enums/user.enum';

export class RegisterDto {
  @ApiProperty({ example: '+966501234567' })
  @IsString()
  @Matches(/^\+966[0-9]{9}$/, { message: 'Phone must be a valid Saudi phone number' })
  phone: string;

  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain uppercase, lowercase, and number',
  })
  password: string;

  @ApiProperty({ example: 'Ahmed' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Al-Saud' })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ example: 'أحمد' })
  @IsOptional()
  @IsString()
  firstNameAr?: string;

  @ApiPropertyOptional({ example: 'السعود' })
  @IsOptional()
  @IsString()
  lastNameAr?: string;

  @ApiPropertyOptional({ enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}