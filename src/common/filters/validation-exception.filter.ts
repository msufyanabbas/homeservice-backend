import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Filter specifically for validation errors (400 Bad Request)
 * Provides detailed validation error messages
 */
@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ValidationExceptionFilter.name);

  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message: string | string[] = 'Validation failed';
    let errors: any = null;

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      message = (exceptionResponse as any).message || message;
      
      // Extract validation errors
      if (Array.isArray((exceptionResponse as any).message)) {
        errors = this.formatValidationErrors((exceptionResponse as any).message);
      }
    }

    // Log validation error
    this.logger.warn(
      `Validation Error: ${request.method} ${request.url}`,
      JSON.stringify(errors || message),
    );

    // Send formatted response
    response.status(status).json({
      statusCode: status,
      message: 'Validation failed',
      errors: errors || message,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    });
  }

  /**
   * Format class-validator error messages
   */
  private formatValidationErrors(messages: string[]): Record<string, string[]> {
    const errors: Record<string, string[]> = {};

    messages.forEach((msg) => {
      // Parse validation error format: "property message"
      const parts = msg.split(' ');
      const property = parts[0];
      const errorMsg = parts.slice(1).join(' ');

      if (!errors[property]) {
        errors[property] = [];
      }
      errors[property].push(errorMsg);
    });

    return errors;
  }
}