import { Module } from '@nestjs/common';
import { HealthModule as NestHealthModule, HealthCheckService, MongooseHealthIndicator } from '@nestjs/terminus';
import { HealthController } from './health.controller';

@Module({
  imports: [NestHealthModule],
  controllers: [HealthController],
  providers: [HealthCheckService, MongooseHealthIndicator],
})
export class HealthModule {}
