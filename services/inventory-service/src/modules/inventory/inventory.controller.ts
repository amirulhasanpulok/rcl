import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import {
  CreateWarehouseDto,
  UpdateInventoryLevelDto,
  ReserveStockDto,
  ConfirmReservationDto,
  CancelReservationDto,
  AdjustStockDto,
} from './dto/inventory.dto';

@ApiTags('Inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // Warehouse Endpoints
  @Post('warehouses')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create warehouse' })
  async createWarehouse(@Body() dto: CreateWarehouseDto) {
    const warehouse = await this.inventoryService.createWarehouse(dto);
    return {
      success: true,
      data: warehouse,
    };
  }

  @Get('warehouses')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all warehouses' })
  async getAllWarehouses() {
    const warehouses = await this.inventoryService.getAllWarehouses();
    return {
      success: true,
      data: warehouses,
      total: warehouses.length,
    };
  }

  @Get('warehouses/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get warehouse by ID' })
  async getWarehouse(@Param('id') id: string) {
    const warehouse = await this.inventoryService.getWarehouse(id);
    return {
      success: true,
      data: warehouse,
    };
  }

  // Inventory Level Endpoints
  @Get('levels/:productId/:warehouseId')
  @ApiOperation({ summary: 'Get inventory level for product in warehouse' })
  async getInventoryLevel(
    @Param('productId') productId: string,
    @Param('warehouseId') warehouseId: string,
  ) {
    const inventory = await this.inventoryService.getInventoryLevel(productId, warehouseId);
    return {
      success: true,
      data: inventory,
    };
  }

  @Get('levels/product/:productId')
  @ApiOperation({ summary: 'Get inventory levels across warehouses for product' })
  async getProductInventory(@Param('productId') productId: string) {
    const inventories = await this.inventoryService.getProductInventory(productId);
    return {
      success: true,
      data: inventories,
      total: inventories.length,
    };
  }

  @Post('levels/initialize')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initialize inventory for product-warehouse' })
  async initializeInventory(
    @Body()
    body: {
      productId: string;
      warehouseId: string;
      quantity: number;
      sku?: string;
    },
  ) {
    const inventory = await this.inventoryService.initializeInventory(
      body.productId,
      body.warehouseId,
      body.quantity,
      body.sku,
    );
    return {
      success: true,
      data: inventory,
    };
  }

  @Put('levels/:productId/:warehouseId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update inventory level' })
  async updateInventoryLevel(
    @Param('productId') productId: string,
    @Param('warehouseId') warehouseId: string,
    @Body() dto: UpdateInventoryLevelDto,
  ) {
    const inventory = await this.inventoryService.updateInventoryLevel(
      productId,
      warehouseId,
      dto,
    );
    return {
      success: true,
      data: inventory,
    };
  }

  // Reservation Endpoints
  @Post('reservations/reserve')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reserve stock for order' })
  async reserveStock(@Request() req, @Body() dto: ReserveStockDto) {
    const reservation = await this.inventoryService.reserveStock(req.user.sub, dto);
    return {
      success: true,
      data: reservation,
    };
  }

  @Post('reservations/confirm')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm reservation (convert to actual stock deduction)' })
  async confirmReservation(@Body() dto: ConfirmReservationDto) {
    const reservation = await this.inventoryService.confirmReservation(dto);
    return {
      success: true,
      data: reservation,
    };
  }

  @Post('reservations/cancel')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel reservation and release stock' })
  async cancelReservation(@Body() dto: CancelReservationDto) {
    const reservation = await this.inventoryService.cancelReservation(dto);
    return {
      success: true,
      data: reservation,
    };
  }

  @Get('reservations/order/:orderId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get reservations for order' })
  async getReservationsByOrder(@Param('orderId') orderId: string) {
    const reservations = await this.inventoryService.getReservationsByOrder(orderId);
    return {
      success: true,
      data: reservations,
      total: reservations.length,
    };
  }

  // Stock Adjustment Endpoints
  @Post('adjustments')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Adjust stock (add/remove/return/damage)' })
  async adjustStock(@Request() req, @Body() dto: AdjustStockDto) {
    const movement = await this.inventoryService.adjustStock(req.user.sub, dto);
    return {
      success: true,
      data: movement,
    };
  }

  // Analysis Endpoints
  @Get('low-stock')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get products with low stock levels' })
  async getLowStockProducts() {
    const products = await this.inventoryService.getLowStockProducts();
    return {
      success: true,
      data: products,
      total: products.length,
    };
  }

  @Get('movements/:productId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get stock movements for product' })
  async getStockMovements(
    @Param('productId') productId: string,
    @Query('warehouseId') warehouseId?: string,
    @Query('days') days: string = '30',
  ) {
    const movements = await this.inventoryService.getStockMovements(
      productId,
      warehouseId,
      parseInt(days),
    );
    return {
      success: true,
      data: movements,
      total: movements.length,
    };
  }
}
