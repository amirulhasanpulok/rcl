import { IsString, IsEnum, IsObject, IsOptional, IsNumber, IsArray, IsBoolean } from 'class-validator';
import { CourierType, ShipmentStatus } from '@/entities/shipment.entity';

export class CreateShipmentDto {
  @IsString()
  tenantId: string;

  @IsString()
  orderId: string;

  @IsOptional()
  @IsEnum(CourierType)
  courier?: CourierType;

  @IsObject()
  recipientInfo: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export class UpdateCourierAccountDto {
  @IsOptional()
  @IsString()
  apiKey?: string;

  @IsOptional()
  @IsString()
  apiSecret?: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @IsOptional()
  @IsNumber()
  priority?: number;

  @IsOptional()
  @IsArray()
  servicableCities?: string[];

  @IsOptional()
  @IsNumber()
  baseCost?: number;
}

export class UpdateShipmentStatusDto {
  @IsEnum(ShipmentStatus)
  status: ShipmentStatus;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsObject()
  trackingDetails?: Record<string, any>;
}

export class CourierRoutingDto {
  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsNumber()
  weight: number;

  @IsNumber()
  value: number;
}
