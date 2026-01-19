import { IsUUID, IsInt, IsString, IsOptional, IsEnum, IsDateString, Min } from 'class-validator';
import { ReservationStatus } from '@/entities/reservation.entity';
import { StockMovementType } from '@/entities/stock-movement.entity';

export class CreateWarehouseDto {
  @IsString()
  name: string;

  @IsString()
  city: string;

  @IsString()
  country: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  manager?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;
}

export class UpdateInventoryLevelDto {
  @IsInt()
  @Min(0)
  quantity: number;

  @IsInt()
  @Min(0)
  minimumThreshold?: number;

  @IsInt()
  @Min(0)
  maximumCapacity?: number;
}

export class ReserveStockDto {
  @IsUUID()
  productId: string;

  @IsUUID()
  warehouseId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsDateString()
  expiresAt: string;
}

export class CreateReservationDto {
  @IsUUID()
  orderId: string;

  @IsUUID()
  productId: string;

  @IsUUID()
  warehouseId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class ConfirmReservationDto {
  @IsUUID()
  reservationId: string;
}

export class CancelReservationDto {
  @IsUUID()
  reservationId: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class AdjustStockDto {
  @IsUUID()
  productId: string;

  @IsUUID()
  warehouseId: string;

  @IsInt()
  quantity: number;

  @IsEnum(StockMovementType)
  type: StockMovementType;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  reference?: string;
}

export class WarehouseResponseDto {
  id: string;
  name: string;
  city: string;
  country: string;
  isActive: boolean;
  createdAt: Date;
}

export class InventoryLevelResponseDto {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  reserved: number;
  available: number;
  minimumThreshold: number;
  maximumCapacity: number;
  isActive: boolean;
}

export class ReservationResponseDto {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  status: ReservationStatus;
  expiresAt: Date;
  createdAt: Date;
}
