import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('RCL Inventory Service')
    .setDescription('Stock management, reservations, multi-warehouse support')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addServer(`http://localhost:${process.env.PORT || 3005}`, 'Development')
    .addServer('https://api.rcl.local', 'Production')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3005;
  await app.listen(port);
  console.log(`🚀 Inventory Service running on port ${port}`);
}

bootstrap();
