import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  private readonly startTime = Date.now();

  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: `${((Date.now() - this.startTime) / 1000).toFixed(2)}s`,
      database: 'connected (mock)',
    };
  }
}
