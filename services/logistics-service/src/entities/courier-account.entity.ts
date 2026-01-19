import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { CourierType } from './shipment.entity';

@Entity('courier_accounts')
@Index(['tenantId', 'courierName'], { unique: true })
export class CourierAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column({
    type: 'enum',
    enum: CourierType,
  })
  courierName: CourierType;

  @Column()
  apiKey: string;

  @Column({ nullable: true })
  apiSecret: string;

  @Column({ type: 'jsonb', nullable: true })
  config: Record<string, any>;

  @Column({ default: true })
  isEnabled: boolean;

  @Column({ type: 'integer', default: 1 })
  priority: number;

  @Column({ type: 'simple-array', nullable: true })
  servicableCities: string[];

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  baseCost: number;

  @Column({ nullable: true })
  lastSyncedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
