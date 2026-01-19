import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { Warehouse } from '@/entities/warehouse.entity';
import { InventoryLevel } from '@/entities/inventory-level.entity';
import { Reservation } from '@/entities/reservation.entity';
import { StockMovement } from '@/entities/stock-movement.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Warehouse, InventoryLevel, Reservation, StockMovement]),
    EventEmitterModule.forRoot(),
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
