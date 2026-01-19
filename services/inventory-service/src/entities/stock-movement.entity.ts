import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum StockMovementType {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
  RETURN = 'return',
  ADJUSTMENT = 'adjustment',
  DAMAGE = 'damage',
  RESERVATION = 'reservation',
  RELEASE = 'release',
}

@Entity('stock_movements')
@Index(['productId'])
@Index(['warehouseId'])
@Index(['type'])
@Index(['createdAt'])
export class StockMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  productId: string;

  @Column('uuid')
  warehouseId: string;

  @Column({
    type: 'enum',
    enum: StockMovementType,
  })
  type: StockMovementType;

  @Column('int')
  quantity: number;

  @Column('int')
  balanceBefore: number;

  @Column('int')
  balanceAfter: number;

  @Column({ nullable: true })
  reference: string;

  @Column({ nullable: true })
  reason: string;

  @Column('uuid', { nullable: true })
  userId: string;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
