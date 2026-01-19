import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { Cart } from '@/entities/cart.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cart]), PassportModule],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
