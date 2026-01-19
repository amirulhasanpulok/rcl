import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum RefundStatus {
  PENDING = 'pending',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
}

@Entity('refunds')
@Index(['transactionId'])
@Index(['refundId'])
export class Refund {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  refundId: string;

  @Column('uuid')
  transactionId: string;

  @Column('uuid')
  orderId: string;

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @Column()
  reason: string;

  @Column({
    type: 'enum',
    enum: RefundStatus,
    default: RefundStatus.PENDING,
  })
  status: RefundStatus;

  @Column()
  stripeRefundId: string;

  @Column({ nullable: true })
  errorMessage: string;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
