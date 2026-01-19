import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum ReservationStatus {
  ACTIVE = 'active',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

@Entity('reservations')
@Index(['orderId'])
@Index(['productId'])
@Index(['warehouseId'])
@Index(['status'])
@Index(['expiresAt'])
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  orderId: string;

  @Column('uuid')
  productId: string;

  @Column('uuid')
  warehouseId: string;

  @Column('int')
  quantity: number;

  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.ACTIVE,
  })
  status: ReservationStatus;

  @Column()
  expiresAt: Date;

  @Column({ nullable: true })
  confirmedAt: Date;

  @Column({ nullable: true })
  cancelledAt: Date;

  @Column({ nullable: true })
  reason: string;

  @CreateDateColumn()
  createdAt: Date;
}
