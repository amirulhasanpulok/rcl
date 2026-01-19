import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Warehouse } from './warehouse.entity';

@Entity('inventory_levels')
@Index(['productId', 'warehouseId'], { unique: true })
@Index(['productId'])
@Index(['warehouseId'])
export class InventoryLevel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  productId: string;

  @Column('uuid')
  warehouseId: string;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouseId' })
  warehouse: Warehouse;

  @Column('int', { default: 0 })
  quantity: number;

  @Column('int', { default: 0 })
  reserved: number;

  @Column('int', { default: 0 })
  available: number;

  @Column('int', { default: 10 })
  minimumThreshold: number;

  @Column('int', { default: 1000 })
  maximumCapacity: number;

  @Column({ nullable: true })
  sku: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
