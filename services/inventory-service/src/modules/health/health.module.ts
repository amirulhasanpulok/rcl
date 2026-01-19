import { Module } from '@nestjs/common';
import { HealthModule as NestHealthModule, HealthCheckService, DatabaseHealthIndicator } from '@nestjs/terminus';
import { HealthController } from './health.controller';

@Module({
  imports: [NestHealthModule],
  controllers: [HealthController],
  providers: [HealthCheckService, DatabaseHealthIndicator],
})
export class HealthModule {}
