import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import {
  CreateTemplateDto,
  UpdateTemplateDto,
  SendEmailDto,
  SendSMSDto,
  BulkSendDto,
} from './dto/notification.dto';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // Template Endpoints
  @Post('templates')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create notification template' })
  async createTemplate(@Request() req, @Body() dto: CreateTemplateDto) {
    const template = await this.notificationService.createTemplate(req.user.sub, dto);
    return {
      success: true,
      data: template,
    };
  }

  @Get('templates/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get template by ID' })
  async getTemplate(@Param('id') id: string) {
    const template = await this.notificationService.getTemplate(id);
    return {
      success: true,
      data: template,
    };
  }

  @Get('templates')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all templates' })
  async getAllTemplates(@Query('category') category?: string, @Query('type') type?: string) {
    const templates = await this.notificationService.getAllTemplates(category as any, type as any);
    return {
      success: true,
      data: templates,
      total: templates.length,
    };
  }

  @Put('templates/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update notification template' })
  async updateTemplate(@Param('id') id: string, @Body() dto: UpdateTemplateDto) {
    const template = await this.notificationService.updateTemplate(id, dto);
    return {
      success: true,
      data: template,
    };
  }

  @Delete('templates/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete notification template' })
  async deleteTemplate(@Param('id') id: string) {
    await this.notificationService.deleteTemplate(id);
    return {
      success: true,
      message: 'Template deleted',
    };
  }

  // Email Endpoints
  @Post('email/send')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send email notification' })
  async sendEmail(@Request() req, @Body() dto: SendEmailDto) {
    const log = await this.notificationService.sendEmail(req.user.sub, dto);
    return {
      success: true,
      data: log,
    };
  }

  @Post('email/bulk')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send bulk emails' })
  async bulkSendEmail(@Request() req, @Body() dto: Omit<BulkSendDto, 'type'> & { type?: 'email' }) {
    const logs = await this.notificationService.bulkSend(req.user.sub, {
      ...dto,
      type: 'email' as any,
    });
    return {
      success: true,
      data: logs,
      total: logs.length,
    };
  }

  // SMS Endpoints
  @Post('sms/send')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send SMS notification' })
  async sendSMS(@Request() req, @Body() dto: SendSMSDto) {
    const log = await this.notificationService.sendSMS(req.user.sub, dto);
    return {
      success: true,
      data: log,
    };
  }

  @Post('sms/bulk')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send bulk SMS' })
  async bulkSendSMS(@Request() req, @Body() dto: Omit<BulkSendDto, 'type'> & { type?: 'sms' }) {
    const logs = await this.notificationService.bulkSend(req.user.sub, {
      ...dto,
      type: 'sms' as any,
    });
    return {
      success: true,
      data: logs,
      total: logs.length,
    };
  }

  // History & Logs
  @Get('logs')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user notification logs' })
  async getNotificationLogs(
    @Request() req,
    @Query('limit') limit: string = '50',
    @Query('skip') skip: string = '0',
  ) {
    const logs = await this.notificationService.getNotificationLogs(
      req.user.sub,
      parseInt(limit),
      parseInt(skip),
    );
    return {
      success: true,
      data: logs,
      total: logs.length,
    };
  }

  @Get('logs/failed')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get failed notifications' })
  async getFailedNotifications(@Query('limit') limit: string = '50') {
    const logs = await this.notificationService.getFailedNotifications(parseInt(limit));
    return {
      success: true,
      data: logs,
      total: logs.length,
    };
  }

  @Post('logs/:id/retry')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retry failed notification' })
  async retryFailedNotification(@Param('id') id: string) {
    const log = await this.notificationService.retryFailedNotification(id);
    return {
      success: true,
      data: log,
    };
  }
}
