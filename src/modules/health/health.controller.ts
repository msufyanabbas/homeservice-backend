import { Controller, Get } from '@nestjs/common';

@Controller() // No prefix - accessible at root
export class HealthController {
  @Get('health')
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}