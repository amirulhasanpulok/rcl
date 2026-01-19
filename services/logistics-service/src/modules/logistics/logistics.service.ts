import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { Shipment, CourierType, ShipmentStatus } from '@/entities/shipment.entity';
import { CourierAccount } from '@/entities/courier-account.entity';
import { CreateShipmentDto, UpdateShipmentStatusDto, CourierRoutingDto } from './dto/logistics.dto';

@Injectable()
export class LogisticsService {
  private logger = new Logger(LogisticsService.name);

  constructor(
    @InjectRepository(Shipment)
    private shipmentRepository: Repository<Shipment>,
    @InjectRepository(CourierAccount)
    private courierAccountRepository: Repository<CourierAccount>,
  ) {}

  // ============== SHIPMENT MANAGEMENT ==============

  async createShipment(dto: CreateShipmentDto): Promise<Shipment> {
    const existingShipment = await this.shipmentRepository.findOne({
      where: { tenantId: dto.tenantId, orderId: dto.orderId },
    });

    if (existingShipment) {
      throw new BadRequestException('Shipment already exists for this order');
    }

    // Select best courier
    const courier = dto.courier || (await this.selectBestCourier(dto.tenantId, dto.recipientInfo));

    const shipment = this.shipmentRepository.create({
      tenantId: dto.tenantId,
      orderId: dto.orderId,
      courier,
      recipientInfo: dto.recipientInfo,
      statusHistory: [
        {
          status: ShipmentStatus.PENDING,
          timestamp: new Date(),
          message: 'Shipment created',
        },
      ],
    });

    await this.shipmentRepository.save(shipment);

    // Auto-book with courier
    await this.bookWithCourier(dto.tenantId, shipment);

    return shipment;
  }

  private async selectBestCourier(tenantId: string, recipientInfo: any): Promise<CourierType> {
    const couriers = await this.courierAccountRepository.find({
      where: {
        tenantId,
        isEnabled: true,
      },
      order: { priority: 'ASC' },
    });

    if (!couriers || couriers.length === 0) {
      throw new BadRequestException('No courier accounts configured');
    }

    // Smart routing: pick courier that services the destination city
    for (const courier of couriers) {
      if (
        !courier.servicableCities ||
        courier.servicableCities.includes(recipientInfo.city.toLowerCase())
      ) {
        return courier.courierName;
      }
    }

    // Fallback to first available
    return couriers[0].courierName;
  }

  private async bookWithCourier(tenantId: string, shipment: Shipment): Promise<void> {
    const courierAccount = await this.courierAccountRepository.findOne({
      where: { tenantId, courierName: shipment.courier },
    });

    if (!courierAccount) {
      throw new BadRequestException(`Courier account not found: ${shipment.courier}`);
    }

    try {
      let trackingNumber: string;
      let cost: number;
      let courierResponse: any;

      if (shipment.courier === CourierType.STEADFAST) {
        ({ trackingNumber, cost, courierResponse } = await this.bookWithSteadfast(
          courierAccount,
          shipment,
        ));
      } else if (shipment.courier === CourierType.PATHAO) {
        ({ trackingNumber, cost, courierResponse } = await this.bookWithPathao(
          courierAccount,
          shipment,
        ));
      }

      shipment.trackingNumber = trackingNumber;
      shipment.cost = cost;
      shipment.courierResponse = courierResponse;
      shipment.status = ShipmentStatus.BOOKED;
      shipment.statusHistory.push({
        status: ShipmentStatus.BOOKED,
        timestamp: new Date(),
        message: `Booked with ${shipment.courier}`,
      });

      await this.shipmentRepository.save(shipment);

      // Emit shipment.created event to event bus
      this.logger.log(`Shipment booked: ${shipment.id} - Tracking: ${trackingNumber}`);
    } catch (error) {
      this.logger.error(`Failed to book shipment with ${shipment.courier}:`, error);
      shipment.status = ShipmentStatus.FAILED;
      shipment.statusHistory.push({
        status: ShipmentStatus.FAILED,
        timestamp: new Date(),
        message: error.message,
      });
      await this.shipmentRepository.save(shipment);
      throw error;
    }
  }

  private async bookWithSteadfast(courierAccount: CourierAccount, shipment: Shipment) {
    const payload = {
      api_key: courierAccount.apiKey,
      secret_key: courierAccount.apiSecret,
      recipient_name: shipment.recipientInfo.name,
      recipient_phone: shipment.recipientInfo.phone,
      recipient_address: shipment.recipientInfo.address,
      recipient_city: shipment.recipientInfo.city,
      recipient_state: shipment.recipientInfo.state,
      recipient_postal_code: shipment.recipientInfo.zipCode,
      cod: '1', // Cash on Delivery enabled
    };

    const response = await axios.post('https://portal.steadfast.io/api/v1/create_order', payload);

    return {
      trackingNumber: response.data.result.tracking_code,
      cost: response.data.result.delivery_fee || courierAccount.baseCost,
      courierResponse: response.data,
    };
  }

  private async bookWithPathao(courierAccount: CourierAccount, shipment: Shipment) {
    const payload = {
      recipient_name: shipment.recipientInfo.name,
      recipient_phone: shipment.recipientInfo.phone,
      recipient_address: shipment.recipientInfo.address,
      recipient_city: shipment.recipientInfo.city,
      recipient_area: shipment.recipientInfo.state,
      merchant_order_id: shipment.orderId,
      cash_on_delivery: '1',
    };

    const response = await axios.post('https://aladdin-api.pathao.com/v2/orders', payload, {
      headers: {
        Authorization: `Bearer ${courierAccount.apiKey}`,
      },
    });

    return {
      trackingNumber: response.data.data.tracking_number,
      cost: response.data.data.delivery_charge || courierAccount.baseCost,
      courierResponse: response.data.data,
    };
  }

  async getShipment(tenantId: string, shipmentId: string): Promise<Shipment> {
    return this.shipmentRepository.findOne({
      where: { id: shipmentId, tenantId },
    });
  }

  async getShipmentByOrder(tenantId: string, orderId: string): Promise<Shipment> {
    return this.shipmentRepository.findOne({
      where: { tenantId, orderId },
    });
  }

  async updateShipmentStatus(
    tenantId: string,
    shipmentId: string,
    dto: UpdateShipmentStatusDto,
  ): Promise<Shipment> {
    const shipment = await this.getShipment(tenantId, shipmentId);

    shipment.status = dto.status;
    shipment.statusHistory.push({
      status: dto.status,
      timestamp: new Date(),
      message: dto.message,
    });

    if (dto.status === ShipmentStatus.DELIVERED) {
      shipment.actualDeliveryDate = new Date();
    }

    return this.shipmentRepository.save(shipment);
  }

  async syncCourierStatus(tenantId: string, shipmentId: string): Promise<void> {
    const shipment = await this.getShipment(tenantId, shipmentId);
    const courierAccount = await this.courierAccountRepository.findOne({
      where: { tenantId, courierName: shipment.courier },
    });

    try {
      let status: ShipmentStatus;

      if (shipment.courier === CourierType.STEADFAST) {
        status = await this.syncSteadfastStatus(courierAccount, shipment.trackingNumber);
      } else if (shipment.courier === CourierType.PATHAO) {
        status = await this.syncPathaoStatus(courierAccount, shipment.trackingNumber);
      }

      if (status && status !== shipment.status) {
        await this.updateShipmentStatus(tenantId, shipmentId, {
          status,
          message: `Status synced from ${shipment.courier}`,
        });
      }
    } catch (error) {
      this.logger.error(`Failed to sync status for shipment ${shipmentId}:`, error);
    }
  }

  private async syncSteadfastStatus(
    courierAccount: CourierAccount,
    trackingNumber: string,
  ): Promise<ShipmentStatus> {
    const response = await axios.get(
      `https://portal.steadfast.io/api/v1/status_by_tracking_code/${trackingNumber}`,
      {
        params: {
          api_key: courierAccount.apiKey,
          secret_key: courierAccount.apiSecret,
        },
      },
    );

    const courierStatus = response.data.result.status;
    return this.mapCourierStatus(courierStatus);
  }

  private async syncPathaoStatus(
    courierAccount: CourierAccount,
    trackingNumber: string,
  ): Promise<ShipmentStatus> {
    const response = await axios.get(
      `https://aladdin-api.pathao.com/v2/orders/${trackingNumber}`,
      {
        headers: {
          Authorization: `Bearer ${courierAccount.apiKey}`,
        },
      },
    );

    const courierStatus = response.data.data.status;
    return this.mapCourierStatus(courierStatus);
  }

  private mapCourierStatus(courierStatus: string): ShipmentStatus {
    const statusMap: Record<string, ShipmentStatus> = {
      pending: ShipmentStatus.PENDING,
      booked: ShipmentStatus.BOOKED,
      in_transit: ShipmentStatus.IN_TRANSIT,
      out_for_delivery: ShipmentStatus.OUT_FOR_DELIVERY,
      delivered: ShipmentStatus.DELIVERED,
      failed: ShipmentStatus.FAILED,
      cancelled: ShipmentStatus.CANCELLED,
    };

    return statusMap[courierStatus.toLowerCase()] || ShipmentStatus.PENDING;
  }

  // ============== COURIER ACCOUNT MANAGEMENT ==============

  async setupCourierAccount(
    tenantId: string,
    courierName: CourierType,
    apiKey: string,
    apiSecret?: string,
    config?: Record<string, any>,
  ): Promise<CourierAccount> {
    let courierAccount = await this.courierAccountRepository.findOne({
      where: { tenantId, courierName },
    });

    if (!courierAccount) {
      courierAccount = this.courierAccountRepository.create({
        tenantId,
        courierName,
        apiKey,
        apiSecret,
        config,
        isEnabled: true,
        priority: 1,
      });
    } else {
      courierAccount.apiKey = apiKey;
      courierAccount.apiSecret = apiSecret;
      courierAccount.config = config;
    }

    return this.courierAccountRepository.save(courierAccount);
  }

  async getCourierAccounts(tenantId: string): Promise<CourierAccount[]> {
    return this.courierAccountRepository.find({
      where: { tenantId },
      order: { priority: 'ASC' },
    });
  }

  async toggleCourierAccount(tenantId: string, courierName: CourierType): Promise<CourierAccount> {
    const courierAccount = await this.courierAccountRepository.findOne({
      where: { tenantId, courierName },
    });

    courierAccount.isEnabled = !courierAccount.isEnabled;
    return this.courierAccountRepository.save(courierAccount);
  }

  // ============== COD RECONCILIATION ==============

  async getCODReconciliation(tenantId: string, dateFrom?: Date, dateTo?: Date): Promise<any> {
    const query = this.shipmentRepository
      .createQueryBuilder('shipment')
      .where('shipment.tenantId = :tenantId', { tenantId })
      .andWhere('shipment.status = :status', { status: ShipmentStatus.DELIVERED });

    if (dateFrom) {
      query.andWhere('shipment.actualDeliveryDate >= :dateFrom', { dateFrom });
    }
    if (dateTo) {
      query.andWhere('shipment.actualDeliveryDate <= :dateTo', { dateTo });
    }

    const shipments = await query.getMany();

    const totalCOD = shipments.reduce((sum, s) => {
      const orderValue = s.recipientInfo ? 0 : 0; // Would fetch from order service
      return sum + orderValue;
    }, 0);

    return {
      totalShipments: shipments.length,
      totalCODAmount: totalCOD,
      courierBreakdown: this.groupByCourier(shipments),
    };
  }

  private groupByCourier(shipments: Shipment[]): Record<string, number> {
    return shipments.reduce(
      (acc, shipment) => {
        acc[shipment.courier] = (acc[shipment.courier] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  }
}
