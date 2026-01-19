import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, MongooseHealthIndicator } from '@nestjs/terminus';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private mongoose: MongooseHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Liveness check' })
  check() {
    return this.health.check([() => this.mongoose.pingCheck('mongodb')]);
  }

  @Get('ready')
  @HealthCheck()
  @ApiOperation({ summary: 'Readiness check' })
  ready() {
    return this.health.check([() => this.mongoose.pingCheck('mongodb')]);
  }

  @Get('live')
  @ApiOperation({ summary: 'Service is alive' })
  live() {
    return { status: 'ok' };
  }
}
