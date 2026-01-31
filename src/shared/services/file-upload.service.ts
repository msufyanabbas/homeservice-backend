import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs/promises';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

export interface UploadedFile {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  url: string;
}

/**
 * File upload service for handling file uploads
 * Supports local storage and can be extended for AWS S3/Azure/GCS
 */
@Injectable()
export class FileUploadService {
  private readonly uploadsDir: string;
  private readonly maxFileSize: number;
  private readonly allowedImageTypes: string[];
  private readonly allowedDocumentTypes: string[];

  constructor(private configService: ConfigService) {
    this.uploadsDir = this.configService.get('UPLOADS_DIR', './uploads');
    this.maxFileSize = this.configService.get('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB
    
    this.allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    this.allowedDocumentTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  }

  /**
   * Upload single file
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'general',
  ): Promise<UploadedFile> {
    this.validateFile(file);

    const filename = this.generateFilename(file.originalname);
    const uploadPath = path.join(this.uploadsDir, folder);
    const filePath = path.join(uploadPath, filename);

    // Ensure directory exists
    await this.ensureDirectory(uploadPath);

    // Save file
    await fs.writeFile(filePath, file.buffer);

    return {
      filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: filePath,
      url: `/uploads/${folder}/${filename}`,
    };
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(
    files: Express.Multer.File[],
    folder: string = 'general',
  ): Promise<UploadedFile[]> {
    return Promise.all(
      files.map((file) => this.uploadFile(file, folder)),
    );
  }

  /**
   * Upload and resize image
   */
  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'images',
    options?: {
      width?: number;
      height?: number;
      quality?: number;
    },
  ): Promise<UploadedFile> {
    this.validateImage(file);

    const filename = this.generateFilename(file.originalname);
    const uploadPath = path.join(this.uploadsDir, folder);
    const filePath = path.join(uploadPath, filename);

    await this.ensureDirectory(uploadPath);

    // Process image with sharp
    let image = sharp(file.buffer);

    if (options?.width || options?.height) {
      image = image.resize(options.width, options.height, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    if (options?.quality) {
      image = image.jpeg({ quality: options.quality });
    }

    await image.toFile(filePath);

    // Get file stats
    const stats = await fs.stat(filePath);

    return {
      filename,
      originalName: file.originalname,
      mimetype: 'image/jpeg',
      size: stats.size,
      path: filePath,
      url: `/uploads/${folder}/${filename}`,
    };
  }

  /**
   * Upload document (PDF, images)
   */
  async uploadDocument(
    file: Express.Multer.File,
    folder: string = 'documents',
  ): Promise<UploadedFile> {
    this.validateDocument(file);
    return this.uploadFile(file, folder);
  }

  /**
   * Delete file
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      // File might not exist, ignore error
    }
  }

  /**
   * Delete multiple files
   */
  async deleteFiles(filePaths: string[]): Promise<void> {
    await Promise.all(filePaths.map((path) => this.deleteFile(path)));
  }

  /**
   * Validate file
   */
  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${this.maxFileSize / (1024 * 1024)}MB`,
      );
    }
  }

  /**
   * Validate image file
   */
  private validateImage(file: Express.Multer.File): void {
    this.validateFile(file);

    if (!this.allowedImageTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid image type. Allowed types: ${this.allowedImageTypes.join(', ')}`,
      );
    }
  }

  /**
   * Validate document file
   */
  private validateDocument(file: Express.Multer.File): void {
    this.validateFile(file);

    if (!this.allowedDocumentTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid document type. Allowed types: ${this.allowedDocumentTypes.join(', ')}`,
      );
    }
  }

  /**
   * Generate unique filename
   */
  private generateFilename(originalName: string): string {
    const ext = path.extname(originalName);
    const uuid = uuidv4();
    return `${uuid}${ext}`;
  }

  /**
   * Ensure directory exists
   */
  private async ensureDirectory(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }
}