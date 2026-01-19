import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/strategies/jwt.guard';
import { LogisticsService } from './logistics.service';
import { CreateShipmentDto, UpdateShipmentStatusDto, UpdateCourierAccountDto } from './dto/logistics.dto';
import { CourierType } from '@/entities/shipment.entity';

@ApiTags('Logistics - Delivery Orchestration Platform')
@Controller('logistics')
export class LogisticsController {
  constructor(private logisticsService: LogisticsService) {}

  // ============== SHIPMENT ENDPOINTS ==============

  @Post('shipments/create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create shipment and auto-book with best courier' })
  async createShipment(@Body() dto: CreateShipmentDto) {
    return this.logisticsService.createShipment(dto);
  }

  @Get('shipments/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get shipment details' })
  async getShipment(@Query('tenant') tenantId: string, @Param('id') shipmentId: string) {
    return this.logisticsService.getShipment(tenantId, shipmentId);
  }

  @Get('shipments/order/:orderId')
  @ApiOperation({ summary: 'Get shipment by order ID (public for tracking)' })
  async getShipmentByOrder(@Query('tenant') tenantId: string, @Param('orderId') orderId: string) {
    return this.logisticsService.getShipmentByOrder(tenantId, orderId);
  }

  @Put('shipments/:id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update shipment status' })
  async updateStatus(
    @Query('tenant') tenantId: string,
    @Param('id') shipmentId: string,
    @Body() dto: UpdateShipmentStatusDto,
  ) {
    return this.logisticsService.updateShipmentStatus(tenantId, shipmentId, dto);
  }

  @Post('shipments/:id/sync')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sync shipment status with courier' })
  async syncStatus(@Query('tenant') tenantId: string, @Param('id') shipmentId: string) {
    await this.logisticsService.syncCourierStatus(tenantId, shipmentId);
    return { success: true };
  }

  // ============== COURIER ACCOUNT ENDPOINTS ==============

  @Post('couriers/setup')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Setup courier account (Steadfast/Pathao) - National logistics integration',
  })
  async setupCourier(
    @Query('tenant') tenantId: string,
    @Body()
    body: {
      courierName: CourierType;
      apiKey: string;
      apiSecret?: string;
      config?: Record<string, any>;
    },
  ) {
    if (!Object.values(CourierType).includes(body.courierName)) {
      throw new BadRequestException('Invalid courier name');
    }

    return this.logisticsService.setupCourierAccount(
      tenantId,
      body.courierName,
      body.apiKey,
      body.apiSecret,
      body.config,
    );
  }

  @Get('couriers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all courier accounts' })
  async getCouriers(@Query('tenant') tenantId: string) {
    return this.logisticsService.getCourierAccounts(tenantId);
  }

  @Put('couriers/:courierName/toggle')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enable/disable courier' })
  async toggleCourier(@Query('tenant') tenantId: string, @Param('courierName') courierName: CourierType) {
    return this.logisticsService.toggleCourierAccount(tenantId, courierName);
  }

  // ============== COD RECONCILIATION ==============

  @Get('reconciliation/cod')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get COD reconciliation report' })
  async getCODReconciliation(
    @Query('tenant') tenantId: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.logisticsService.getCODReconciliation(
      tenantId,
      dateFrom ? new Date(dateFrom) : undefined,
      dateTo ? new Date(dateTo) : undefined,
    );
  }
}
