import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum PaymentIntentStatus {
  INITIATED = 'initiated',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELED = 'canceled',
}

@Entity('payment_intents')
@Index(['orderId'])
@Index(['stripeIntentId'])
@Index(['userId'])
export class PaymentIntent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  orderId: string;

  @Column('uuid')
  userId: string;

  @Column()
  stripeIntentId: string;

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @Column()
  currency: string;

  @Column({
    type: 'enum',
    enum: PaymentIntentStatus,
    default: PaymentIntentStatus.INITIATED,
  })
  status: PaymentIntentStatus;

  @Column({ nullable: true })
  stripePublishableKey: string;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
