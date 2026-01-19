import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { databaseConfig } from './config/database.config';
import { InventoryModule } from './modules/inventory/inventory.module';
import { HealthModule } from './modules/health/health.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { Warehouse } from './entities/warehouse.entity';
import { InventoryLevel } from './entities/inventory-level.entity';
import { Reservation } from './entities/reservation.entity';
import { StockMovement } from './entities/stock-movement.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      ...databaseConfig,
      entities: [Warehouse, InventoryLevel, Reservation, StockMovement],
    }),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'jwt_secret_key',
      signOptions: { expiresIn: '24h' },
    }),
    EventEmitterModule.forRoot(),
    InventoryModule,
    HealthModule,
  ],
  providers: [JwtStrategy],
})
export class AppModule {}
