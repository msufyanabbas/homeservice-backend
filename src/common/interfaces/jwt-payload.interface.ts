import { UserRole } from '@common/enums/user.enum';

export interface JwtPayload {
  sub: string; // User ID
  email?: string;
  phone: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface JwtRefreshPayload {
  sub: string;
  tokenId: string;
}