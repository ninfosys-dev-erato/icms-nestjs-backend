import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as compression from 'compression';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from '@/common/filters/http-exception.filter';
import { ApiResponseInterceptor } from '@/common/interceptors/api-response.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Get configuration
  const port = configService.get<number>('app.port', 3000);
  const apiPrefix = configService.get<string>('app.apiPrefix', 'api/v1');
  const nodeEnv = configService.get<string>('app.nodeEnv', 'development');

  // Global prefix
  app.setGlobalPrefix(apiPrefix);

  // Security middleware
  if (configService.get<boolean>('app.features.enableHelmet', true)) {
    app.use(helmet());
  }

  if (configService.get<boolean>('app.features.enableCompression', true)) {
    app.use(compression());
  }

  // CORS
  if (configService.get<boolean>('app.features.enableCors', true)) {
    const corsConfig = configService.get('app.cors');
    app.enableCors({
      origin: corsConfig.origin,
      credentials: corsConfig.credentials,
    });
  }

  // Cookie parser
  app.use(cookieParser());

  // Global request logging middleware for debugging
  app.use((req, res, next) => {
    if (req.path.includes('/media/upload') || req.path.includes('/office-settings') && req.method === 'POST') {
      console.log('🌐 DEBUG: Incoming Request');
      console.log('  Method:', req.method);
      console.log('  URL:', req.url);
      console.log('  Path:', req.path);
      console.log('  Content-Type:', req.headers['content-type']);
      console.log('  Content-Length:', req.headers['content-length']);
      console.log('  User-Agent:', req.headers['user-agent']);
      console.log('  Authorization:', req.headers['authorization'] ? 'Present' : 'Missing');
      console.log('  Body keys:', Object.keys(req.body || {}));
      console.log('  Files:', req.files ? Object.keys(req.files) : 'None');
      console.log('  File:', req.file ? 'Present' : 'None');
      console.log('=====================================');
    }
    next();
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false, // Changed from true to false to allow extra fields in multipart/form-data
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(new ApiResponseInterceptor());

  // Swagger documentation
  if (configService.get<boolean>('app.features.enableSwagger', true)) {
    const config = new DocumentBuilder()
      .setTitle('ICMS Backend API')
      .setDescription('Integrated Content Management System Backend API')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication endpoints')
      .addTag('users', 'User management endpoints')
      .addTag('content', 'Content management endpoints')
      .addTag('media', 'Media management endpoints')
      .addTag('settings', 'System settings endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.listen(port);

  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  logger.log(`🌍 Environment: ${nodeEnv}`);
  logger.log(`🔗 API Prefix: /${apiPrefix}`);
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
}); 