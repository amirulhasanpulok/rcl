import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder, SwaggerCustomOptions } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security
  app.use(helmet());
  app.use(compression());

  // Validation
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
  });

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Marketing Service - Growth & SEO Brain')
    .setDescription(
      'Commerce Operating System Marketing Layer: SEO Management, Tag Management (GTM/GA4/Meta/TikTok), Conversion Tracking',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Marketing', 'SEO and conversion tracking')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const customOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customCss: '.swagger-ui .topbar { display: none }',
  };
  SwaggerModule.setup('api/docs', app, document, customOptions);

  const PORT = process.env.PORT || 3009;
  await app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Marketing Service listening on http://0.0.0.0:${PORT}`);
    console.log(`📚 Swagger: http://0.0.0.0:${PORT}/api/docs`);
  });
}

bootstrap().catch(console.error);
