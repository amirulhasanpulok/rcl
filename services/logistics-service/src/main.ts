import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security middleware
  app.use(helmet());
  app.use(compression());

  // CORS configuration
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:3007', 'http://localhost:3008'],
    credentials: true,
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Logistics Service - Delivery Orchestration API')
    .setDescription(
      'Multi-courier shipment management, auto-booking, smart routing, and COD reconciliation. Supports Steadfast and Pathao couriers for Bangladesh market and beyond.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'jwt',
    )
    .addTag('Shipments', 'Create, track, and manage shipments')
    .addTag('Couriers', 'Configure and manage courier accounts')
    .addTag('Reconciliation', 'COD and financial reconciliation')
    .addTag('Health', 'Service health and readiness')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3010;
  await app.listen(port);
  console.log(`🚀 Logistics Service listening on port ${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/docs`);
}

bootstrap();
