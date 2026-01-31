import { IsString, IsEmail, IsOptional, MinLength, Matches, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@common/enums/user.enum';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @Matches(/^\+966[0-9]{9}$/)
  phone: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  firstNameAr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastNameAr?: string;

  @ApiPropertyOptional({ enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}