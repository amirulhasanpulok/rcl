import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Info')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Service info' })
  getInfo() {
    return {
      service: 'RCL Inventory Service',
      version: '1.0.0',
      port: process.env.PORT || 3005,
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
