import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provider } from '@database/entities/provider.entity';
import { ProviderStatus } from '@common/enums/provider.enum';

/**
 * Guard to check provider status
 * Only allows active/approved providers to access certain endpoints
 */
@Injectable()
export class ProviderStatusGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(Provider)
    private providerRepository: Repository<Provider>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Only check for providers
    if (user.role !== 'PROVIDER') {
      return true; // Not a provider, skip check
    }

    // Get provider from database
    const provider = await this.providerRepository.findOne({
      where: { userId: user.sub },
    });

    if (!provider) {
      throw new ForbiddenException('Provider profile not found');
    }

    // Check if provider is approved
    if (provider.status !== ProviderStatus.APPROVED) {
      throw new ForbiddenException(
        `Provider account is ${provider.status.toLowerCase()}. Please wait for approval or contact support.`,
      );
    }

    // Attach provider to request for later use
    request.provider = provider;

    return true;
  }
}