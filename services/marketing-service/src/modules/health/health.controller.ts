import { Controller, Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Service health check' })
  health() {
    return {
      status: 'ok',
      service: 'marketing-service',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Service readiness check' })
  ready() {
    return { ready: true };
  }

  @Get('live')
  @ApiOperation({ summary: 'Service liveness check' })
  live() {
    return { alive: true };
  }
}
