import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('/info')
  getInfo() {
    return {
      service: 'logistics-service',
      version: '1.0.0',
      purpose: 'Delivery Orchestration Platform',
      capabilities: ['multi-courier-routing', 'auto-booking', 'cod-reconciliation', 'shipment-tracking'],
      supportedCouriers: ['steadfast', 'pathao'],
      status: 'operational',
    };
  }
}
