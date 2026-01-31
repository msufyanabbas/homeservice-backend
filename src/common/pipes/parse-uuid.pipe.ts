import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { validate as isUuid } from 'uuid';

/**
 * Pipe to validate and parse UUID parameters
 * Throws BadRequestException if UUID is invalid
 */
@Injectable()
export class ParseUuidPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!isUuid(value)) {
      throw new BadRequestException(`Invalid UUID format: ${value}`);
    }
    return value;
  }
}