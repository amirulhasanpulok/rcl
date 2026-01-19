import { Controller, Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

@Controller()
export class AppController {
  @Get('info')
  @ApiOperation({ summary: 'Get service info' })
  getInfo() {
    return {
      name: 'Marketing Service',
      version: '1.0.0',
      description: 'Commerce Operating System - Growth & SEO Brain',
      timestamp: new Date().toISOString(),
    };
  }
}
