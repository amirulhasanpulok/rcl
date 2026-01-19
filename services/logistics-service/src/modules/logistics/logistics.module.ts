import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogisticsService } from './logistics.service';
import { LogisticsController } from './logistics.controller';
import { Shipment } from '@/entities/shipment.entity';
import { CourierAccount } from '@/entities/courier-account.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Shipment, CourierAccount])],
  controllers: [LogisticsController],
  providers: [LogisticsService],
  exports: [LogisticsService],
})
export class LogisticsModule {}
