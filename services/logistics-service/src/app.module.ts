import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogisticsModule } from './modules/logistics/logistics.module';
import { HealthModule } from './modules/health/health.module';
import { ShipmentEntity } from './entities/shipment.entity';
import { CourierAccountEntity } from './entities/courier-account.entity';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.logistics', '.env'],
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      username: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      database: process.env.POSTGRES_DB || 'logistics_db',
      entities: [ShipmentEntity, CourierAccountEntity],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
    }),
    TypeOrmModule.forFeature([ShipmentEntity, CourierAccountEntity]),
    LogisticsModule,
    HealthModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
