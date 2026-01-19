import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Warehouse } from '@/entities/warehouse.entity';
import { InventoryLevel } from '@/entities/inventory-level.entity';
import { Reservation, ReservationStatus } from '@/entities/reservation.entity';
import { StockMovement, StockMovementType } from '@/entities/stock-movement.entity';
import {
  CreateWarehouseDto,
  UpdateInventoryLevelDto,
  ReserveStockDto,
  CreateReservationDto,
  ConfirmReservationDto,
  CancelReservationDto,
  AdjustStockDto,
} from './dto/inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
    @InjectRepository(InventoryLevel)
    private readonly inventoryLevelRepository: Repository<InventoryLevel>,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(StockMovement)
    private readonly stockMovementRepository: Repository<StockMovement>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // Warehouse Management
  async createWarehouse(dto: CreateWarehouseDto): Promise<Warehouse> {
    const warehouse = this.warehouseRepository.create(dto);
    return this.warehouseRepository.save(warehouse);
  }

  async getWarehouse(id: string): Promise<Warehouse> {
    const warehouse = await this.warehouseRepository.findOne({ where: { id } });
    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }
    return warehouse;
  }

  async getAllWarehouses(): Promise<Warehouse[]> {
    return this.warehouseRepository.find({ where: { isActive: true } });
  }

  // Inventory Level Management
  async getInventoryLevel(productId: string, warehouseId: string): Promise<InventoryLevel> {
    const inventory = await this.inventoryLevelRepository.findOne({
      where: { productId, warehouseId },
    });
    if (!inventory) {
      throw new NotFoundException('Inventory level not found');
    }
    return inventory;
  }

  async getProductInventory(productId: string): Promise<InventoryLevel[]> {
    return this.inventoryLevelRepository.find({
      where: { productId, isActive: true },
      relations: ['warehouse'],
    });
  }

  async initializeInventory(
    productId: string,
    warehouseId: string,
    quantity: number,
    sku?: string,
  ): Promise<InventoryLevel> {
    const existing = await this.inventoryLevelRepository.findOne({
      where: { productId, warehouseId },
    });

    if (existing) {
      throw new BadRequestException('Inventory level already exists for this product-warehouse');
    }

    const inventory = this.inventoryLevelRepository.create({
      productId,
      warehouseId,
      quantity,
      available: quantity,
      sku,
    });

    const saved = await this.inventoryLevelRepository.save(inventory);

    this.eventEmitter.emit('stock.updated', {
      productId,
      warehouseId,
      quantity,
      type: StockMovementType.INBOUND,
      timestamp: new Date(),
    });

    return saved;
  }

  async updateInventoryLevel(
    productId: string,
    warehouseId: string,
    dto: UpdateInventoryLevelDto,
  ): Promise<InventoryLevel> {
    const inventory = await this.getInventoryLevel(productId, warehouseId);

    if (dto.quantity > dto.maximumCapacity || 0) {
      throw new BadRequestException('Quantity exceeds maximum capacity');
    }

    const oldQuantity = inventory.quantity;
    inventory.quantity = dto.quantity;
    inventory.available = inventory.quantity - inventory.reserved;

    if (dto.minimumThreshold !== undefined) {
      inventory.minimumThreshold = dto.minimumThreshold;
    }
    if (dto.maximumCapacity !== undefined) {
      inventory.maximumCapacity = dto.maximumCapacity;
    }

    const saved = await this.inventoryLevelRepository.save(inventory);

    // Record stock movement
    const movement = this.stockMovementRepository.create({
      productId,
      warehouseId,
      type: StockMovementType.ADJUSTMENT,
      quantity: dto.quantity - oldQuantity,
      balanceBefore: oldQuantity,
      balanceAfter: inventory.quantity,
      reason: 'Inventory adjustment',
    });

    await this.stockMovementRepository.save(movement);

    this.eventEmitter.emit('stock.updated', {
      productId,
      warehouseId,
      quantity: inventory.quantity,
      available: inventory.available,
      timestamp: new Date(),
    });

    return saved;
  }

  // Reservation Management
  async reserveStock(userId: string, dto: ReserveStockDto): Promise<Reservation> {
    const inventory = await this.getInventoryLevel(dto.productId, dto.warehouseId);

    if (inventory.available < dto.quantity) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${inventory.available}, Requested: ${dto.quantity}`,
      );
    }

    const reservation = this.reservationRepository.create({
      orderId: `order-${Date.now()}`, // Will be replaced with actual order ID
      ...dto,
      expiresAt: new Date(dto.expiresAt),
    });

    const saved = await this.reservationRepository.save(reservation);

    // Update inventory reserved count
    inventory.reserved += dto.quantity;
    inventory.available = inventory.quantity - inventory.reserved;
    await this.inventoryLevelRepository.save(inventory);

    this.eventEmitter.emit('stock.reserved', {
      reservationId: saved.id,
      productId: dto.productId,
      quantity: dto.quantity,
      warehouseId: dto.warehouseId,
      timestamp: new Date(),
    });

    return saved;
  }

  async confirmReservation(dto: ConfirmReservationDto): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id: dto.reservationId },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (reservation.status !== ReservationStatus.ACTIVE) {
      throw new BadRequestException('Reservation is not active');
    }

    reservation.status = ReservationStatus.CONFIRMED;
    reservation.confirmedAt = new Date();

    const saved = await this.reservationRepository.save(reservation);

    this.eventEmitter.emit('stock.confirmed', {
      reservationId: saved.id,
      productId: reservation.productId,
      quantity: reservation.quantity,
      timestamp: new Date(),
    });

    return saved;
  }

  async cancelReservation(dto: CancelReservationDto): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id: dto.reservationId },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (reservation.status === ReservationStatus.CANCELLED) {
      throw new BadRequestException('Reservation already cancelled');
    }

    // Release reserved stock
    const inventory = await this.getInventoryLevel(reservation.productId, reservation.warehouseId);
    inventory.reserved = Math.max(0, inventory.reserved - reservation.quantity);
    inventory.available = inventory.quantity - inventory.reserved;
    await this.inventoryLevelRepository.save(inventory);

    reservation.status = ReservationStatus.CANCELLED;
    reservation.cancelledAt = new Date();
    reservation.reason = dto.reason || 'Cancelled by user';

    const saved = await this.reservationRepository.save(reservation);

    this.eventEmitter.emit('stock.released', {
      reservationId: saved.id,
      productId: reservation.productId,
      quantity: reservation.quantity,
      timestamp: new Date(),
    });

    return saved;
  }

  async getReservationsByOrder(orderId: string): Promise<Reservation[]> {
    return this.reservationRepository.find({
      where: { orderId },
      order: { createdAt: 'DESC' },
    });
  }

  // Stock Movement & Adjustments
  async adjustStock(userId: string, dto: AdjustStockDto): Promise<StockMovement> {
    const inventory = await this.getInventoryLevel(dto.productId, dto.warehouseId);

    const newQuantity = inventory.quantity + dto.quantity;
    if (newQuantity < 0) {
      throw new BadRequestException('Adjustment would result in negative stock');
    }

    if (newQuantity > inventory.maximumCapacity) {
      throw new BadRequestException('Adjustment exceeds maximum capacity');
    }

    const movement = this.stockMovementRepository.create({
      productId: dto.productId,
      warehouseId: dto.warehouseId,
      type: dto.type,
      quantity: dto.quantity,
      balanceBefore: inventory.quantity,
      balanceAfter: newQuantity,
      reason: dto.reason,
      reference: dto.reference,
      userId,
    });

    inventory.quantity = newQuantity;
    inventory.available = inventory.quantity - inventory.reserved;

    await this.inventoryLevelRepository.save(inventory);
    const saved = await this.stockMovementRepository.save(movement);

    this.eventEmitter.emit('stock.adjusted', {
      productId: dto.productId,
      quantity: newQuantity,
      type: dto.type,
      timestamp: new Date(),
    });

    return saved;
  }

  async getLowStockProducts(): Promise<InventoryLevel[]> {
    return this.inventoryLevelRepository
      .createQueryBuilder('inventory')
      .where('inventory.available <= inventory.minimumThreshold')
      .andWhere('inventory.isActive = true')
      .orderBy('inventory.available', 'ASC')
      .getMany();
  }

  async getStockMovements(productId: string, warehouseId?: string, days: number = 30) {
    const query = this.stockMovementRepository.createQueryBuilder('movement')
      .where('movement.productId = :productId', { productId })
      .andWhere('movement.createdAt >= :dateFrom', {
        dateFrom: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
      });

    if (warehouseId) {
      query.andWhere('movement.warehouseId = :warehouseId', { warehouseId });
    }

    return query.orderBy('movement.createdAt', 'DESC').getMany();
  }

  async expireReservations(): Promise<void> {
    const expiredReservations = await this.reservationRepository.find({
      where: {
        status: ReservationStatus.ACTIVE,
        expiresAt: LessThan(new Date()),
      },
    });

    for (const reservation of expiredReservations) {
      await this.cancelReservation({
        reservationId: reservation.id,
        reason: 'Reservation expired',
      });
    }
  }
}
