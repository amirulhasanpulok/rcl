import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { MarketingModule } from './modules/marketing/marketing.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/marketing_service',
    ),
    MarketingModule,
    HealthModule,
  ],
})
export class AppModule {}
