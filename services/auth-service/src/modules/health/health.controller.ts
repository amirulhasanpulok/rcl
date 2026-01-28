import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  health(): {
    status: string;
    timestamp: string;
    uptime: number;
    service: string;
  } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      service: 'auth-service',
    };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe for Kubernetes' })
  readiness(): { ready: boolean } {
    return { ready: true };
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness probe for Kubernetes' })
  liveness(): { alive: boolean } {
    return { alive: true };
  }
}

