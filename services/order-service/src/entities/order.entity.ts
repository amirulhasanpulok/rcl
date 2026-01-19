import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { v4 as uuid } from 'uuid';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export class OrderItem {
  productId: string;
  productSku: string;
  productName: string;
  variantId?: string;
  quantity: number;
  price: number;
  discount?: number;
  tax?: number;
  total: number;
}

@Entity('orders')
@Index(['userId', 'status'])
@Index(['orderNumber'], { unique: true })
@Index(['createdAt', 'status'])
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string = uuid();

  @Column({ type: 'varchar', unique: true })
  orderNumber: string;

  @Column({ type: 'varchar' })
  userId: string;

  @Column({ type: 'simple-array' })
  items: OrderItem[];

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  @Column({ type: 'varchar', nullable: true })
  paymentIntentId?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tax: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  shippingCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ type: 'varchar', nullable: true })
  couponCode?: string;

  @Column({ type: 'json' })
  shippingAddress: any;

  @Column({ type: 'json', nullable: true })
  billingAddress?: any;

  @Column({ type: 'varchar', nullable: true })
  shippingMethod?: string;

  @Column({ type: 'varchar', nullable: true })
  trackingNumber?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  shippedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt?: Date;
}
