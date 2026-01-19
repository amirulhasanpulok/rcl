import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('System')
@Controller()
export class AppController {
  @Get()
  getHello(): { message: string; version: string } {
    return {
      message: 'RCL E-Commerce API Gateway',
      version: '1.0.0',
    };
  }
}
