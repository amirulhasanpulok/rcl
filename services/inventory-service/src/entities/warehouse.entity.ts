import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('warehouses')
export class Warehouse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  city: string;

  @Column()
  country: string;

  @Column({ nullable: true })
  address: string;

  @Column('decimal', { precision: 10, scale: 6, nullable: true })
  latitude: number;

  @Column('decimal', { precision: 10, scale: 6, nullable: true })
  longitude: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  manager: string;

  @Column({ nullable: true })
  contactPhone: string;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
