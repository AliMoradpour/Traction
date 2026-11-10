import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';

/** Public, cheap liveness check. Also used to wake the hosted server. */
@Controller('health')
@SkipThrottle()
export class HealthController {
  @Get()
  check(): { status: 'ok'; time: string } {
    return { status: 'ok', time: new Date().toISOString() };
  }
}
