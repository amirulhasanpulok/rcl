import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.PAYMENT_DB_HOST || 'payment-db',
  port: parseInt(process.env.PAYMENT_DB_PORT || '5432'),
  username: process.env.PAYMENT_DB_USER || 'payment_user',
  password: process.env.PAYMENT_DB_PASSWORD || 'payment_password',
  database: process.env.PAYMENT_DB_NAME || 'payment_service',
  entities: [__dirname + '/../entities/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV !== 'production',
};
