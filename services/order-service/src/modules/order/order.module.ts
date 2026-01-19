import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { Order } from '@/entities/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order]), PassportModule],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
