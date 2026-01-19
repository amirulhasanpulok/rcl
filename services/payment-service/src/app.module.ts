import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { databaseConfig } from './config/database.config';
import { PaymentModule } from './modules/payment/payment.module';
import { HealthModule } from './modules/health/health.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PaymentIntent } from './entities/payment-intent.entity';
import { Transaction } from './entities/transaction.entity';
import { Refund } from './entities/refund.entity';
import { WebhookEvent } from './entities/webhook-event.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      ...databaseConfig,
      entities: [PaymentIntent, Transaction, Refund, WebhookEvent],
    }),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'jwt_secret_key',
      signOptions: { expiresIn: '24h' },
    }),
    EventEmitterModule.forRoot(),
    PaymentModule,
    HealthModule,
  ],
  providers: [JwtStrategy],
})
export class AppModule {}
