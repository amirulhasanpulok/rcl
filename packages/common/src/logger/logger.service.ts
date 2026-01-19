import { Logger } from '@nestjs/common';

export class LoggerService {
  private logger: Logger;

  constructor(context: string) {
    this.logger = new Logger(context);
  }

  info(message: string, data?: any): void {
    this.logger.log(message, data ? JSON.stringify(data) : '');
  }

  error(message: string, error?: any): void {
    this.logger.error(message, error?.stack || JSON.stringify(error));
  }

  warn(message: string, data?: any): void {
    this.logger.warn(message, data ? JSON.stringify(data) : '');
  }

  debug(message: string, data?: any): void {
    this.logger.debug(message, data ? JSON.stringify(data) : '');
  }
}
