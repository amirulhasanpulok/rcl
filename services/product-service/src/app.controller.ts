import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('System')
@Controller()
export class AppController {
  @Get()
  getInfo(): { message: string; version: string; service: string } {
    return {
      message: 'RCL Product Service',
      version: '1.0.0',
      service: 'product-service',
    };
  }
}
