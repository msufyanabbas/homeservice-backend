import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

/**
 * Crypto utilities for encryption, hashing, and token generation
 */

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compare password with hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate random OTP code
 */
export function generateOtp(length: number = 6): string {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  
  return otp;
}

/**
 * Generate random token
 */
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate UUID v4
 */
export function generateUuid(): string {
  return crypto.randomUUID();
}

/**
 * Hash string using SHA256
 */
export function sha256Hash(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Create HMAC signature
 */
export function createHmacSignature(data: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

/**
 * Verify HMAC signature
 */
export function verifyHmacSignature(data: string, signature: string, secret: string): boolean {
  const expectedSignature = createHmacSignature(data, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature),
  );
}

/**
 * Encrypt data using AES-256-GCM
 */
export function encrypt(text: string, key: string): { encrypted: string; iv: string; tag: string } {
  const algorithm = 'aes-256-gcm';
  const keyBuffer = crypto.scryptSync(key, 'salt', 32);
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(algorithm, keyBuffer, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
  };
}

/**
 * Decrypt data using AES-256-GCM
 */
export function decrypt(encrypted: string, key: string, iv: string, tag: string): string {
  const algorithm = 'aes-256-gcm';
  const keyBuffer = crypto.scryptSync(key, 'salt', 32);
  const ivBuffer = Buffer.from(iv, 'hex');
  const tagBuffer = Buffer.from(tag, 'hex');
  
  const decipher = crypto.createDecipheriv(algorithm, keyBuffer, ivBuffer);
  decipher.setAuthTag(tagBuffer);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Generate random string
 */
export function generateRandomString(length: number = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Generate alphanumeric code
 */
export function generateAlphanumericCode(length: number = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous characters
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}