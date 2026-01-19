import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Order, OrderStatus, PaymentStatus } from '@/entities/order.entity';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
    // Generate order number (format: ORD-YYYYMMDD-XXXXX)
    const orderNumber = this.generateOrderNumber();

    const order = this.orderRepository.create({
      userId,
      orderNumber,
      items: createOrderDto.items,
      subtotal: createOrderDto.subtotal,
      tax: createOrderDto.tax || 0,
      shippingCost: createOrderDto.shippingCost || 0,
      discount: createOrderDto.discount || 0,
      total: createOrderDto.total,
      couponCode: createOrderDto.couponCode,
      shippingAddress: createOrderDto.shippingAddress,
      billingAddress: createOrderDto.billingAddress,
      shippingMethod: createOrderDto.shippingMethod,
      notes: createOrderDto.notes,
    });

    const savedOrder = await this.orderRepository.save(order);

    // Emit order.created event
    this.eventEmitter.emit('order.created', {
      orderId: savedOrder.id,
      orderNumber: savedOrder.orderNumber,
      userId: savedOrder.userId,
      total: savedOrder.total,
      items: savedOrder.items,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`Order created: ${orderNumber}`);
    return savedOrder;
  }

  async findById(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async findByOrderNumber(orderNumber: string): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { orderNumber } });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async findUserOrders(userId: string, page: number = 1, limit: number = 20): Promise<{
    items: Order[];
    total: number;
  }> {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.orderRepository
        .find({
          where: { userId },
          order: { createdAt: 'DESC' },
          skip,
          take: limit,
        }),
      this.orderRepository.countDocuments({ userId }),
    ]);

    return { items, total };
  }

  async updateStatus(id: string, updateOrderStatusDto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.findById(id);

    const previousStatus = order.status;
    order.status = updateOrderStatusDto.status;

    if (updateOrderStatusDto.trackingNumber) {
      order.trackingNumber = updateOrderStatusDto.trackingNumber;
    }

    if (updateOrderStatusDto.status === OrderStatus.SHIPPED) {
      order.shippedAt = new Date();
    }

    if (updateOrderStatusDto.status === OrderStatus.DELIVERED) {
      order.deliveredAt = new Date();
    }

    const updatedOrder = await this.orderRepository.save(order);

    // Emit status changed event
    this.eventEmitter.emit('order.status.changed', {
      orderId: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      userId: updatedOrder.userId,
      previousStatus,
      newStatus: updatedOrder.status,
      trackingNumber: updatedOrder.trackingNumber,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`Order ${order.orderNumber} status changed to ${updateOrderStatusDto.status}`);
    return updatedOrder;
  }

  async updatePaymentStatus(
    id: string,
    paymentStatus: PaymentStatus,
    paymentIntentId?: string,
  ): Promise<Order> {
    const order = await this.findById(id);

    order.paymentStatus = paymentStatus;
    if (paymentIntentId) {
      order.paymentIntentId = paymentIntentId;
    }

    const updatedOrder = await this.orderRepository.save(order);

    // Emit payment status changed event
    this.eventEmitter.emit('order.payment.updated', {
      orderId: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      userId: updatedOrder.userId,
      paymentStatus: updatedOrder.paymentStatus,
      paymentIntentId: updatedOrder.paymentIntentId,
      timestamp: new Date().toISOString(),
    });

    return updatedOrder;
  }

  async cancel(id: string): Promise<Order> {
    const order = await this.findById(id);

    if (
      order.status === OrderStatus.SHIPPED ||
      order.status === OrderStatus.DELIVERED ||
      order.status === OrderStatus.CANCELLED
    ) {
      throw new BadRequestException('Cannot cancel order in current status');
    }

    order.status = OrderStatus.CANCELLED;
    const cancelledOrder = await this.orderRepository.save(order);

    // Emit order.cancelled event
    this.eventEmitter.emit('order.cancelled', {
      orderId: cancelledOrder.id,
      orderNumber: cancelledOrder.orderNumber,
      userId: cancelledOrder.userId,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`Order cancelled: ${order.orderNumber}`);
    return cancelledOrder;
  }

  private generateOrderNumber(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `ORD-${dateStr}-${random}`;
  }
}
