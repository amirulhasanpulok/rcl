import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum CourierType {
  STEADFAST = 'steadfast',
  PATHAO = 'pathao',
}

export enum ShipmentStatus {
  PENDING = 'pending',
  BOOKED = 'booked',
  IN_TRANSIT = 'in_transit',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Entity('shipments')
@Index(['tenantId', 'orderId'], { unique: true })
@Index(['tenantId', 'trackingNumber'])
@Index(['tenantId', 'status'])
export class Shipment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  orderId: string;

  @Column()
  courier: CourierType;

  @Column({ nullable: true })
  trackingNumber: string;

  @Column({
    type: 'enum',
    enum: ShipmentStatus,
    default: ShipmentStatus.PENDING,
  })
  status: ShipmentStatus;

  @Column({ type: 'jsonb', nullable: true })
  recipientInfo: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost: number;

  @Column({ type: 'jsonb', nullable: true })
  courierResponse: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  statusHistory: Array<{
    status: ShipmentStatus;
    timestamp: Date;
    message?: string;
  }>;

  @Column({ nullable: true })
  estimatedDeliveryDate: Date;

  @Column({ nullable: true })
  actualDeliveryDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
