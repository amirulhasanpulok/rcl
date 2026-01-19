import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { v4 as uuid } from 'uuid';

export enum CartStatus {
  ACTIVE = 'active',
  ABANDONED = 'abandoned',
  CONVERTED = 'converted',
}

export class CartItem {
  productId: string;
  productSku: string;
  productName: string;
  variantId?: string;
  quantity: number;
  price: number;
  discount?: number;
}

@Entity('carts')
@Index(['userId', 'status'])
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  id: string = uuid();

  @Column({ type: 'varchar' })
  userId: string;

  @Column({ type: 'simple-array' })
  items: CartItem[];

  @Column({ type: 'enum', enum: CartStatus, default: CartStatus.ACTIVE })
  status: CartStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tax: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  shippingCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total: number;

  @Column({ type: 'varchar', nullable: true })
  couponCode?: string;

  @Column({ type: 'json', nullable: true })
  shippingAddress?: any;

  @Column({ type: 'varchar', nullable: true })
  shippingMethod?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  abandonedAt?: Date;
}
