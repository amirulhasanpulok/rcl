import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.INVENTORY_DB_HOST || 'inventory-db',
  port: parseInt(process.env.INVENTORY_DB_PORT || '5432'),
  username: process.env.INVENTORY_DB_USER || 'inventory_user',
  password: process.env.INVENTORY_DB_PASSWORD || 'inventory_password',
  database: process.env.INVENTORY_DB_NAME || 'inventory_service',
  entities: [__dirname + '/../entities/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV !== 'production',
};
