import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from '@common/filters/http-execution.filter';
import { TransformInterceptor } from '@common/interceptors/transform.interceptor';
import { LoggingInterceptor } from '@common/interceptors/logging.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ValidationExceptionFilter } from './common/filters/validation-exception.filter';
import { CacheInterceptor } from './common/interceptors/cache.interceptor';
import { CACHE_MANAGER } from '@nestjs/cache-manager/dist/cache.constants';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    cors: true,
  });

  const configService = app.get(ConfigService);

  const reflector = app.get(Reflector);
  const cacheManager = app.get(CACHE_MANAGER);

  // Security
  app.use(helmet());
  app.useGlobalInterceptors(new CacheInterceptor(cacheManager, reflector));
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new ValidationExceptionFilter(), new AllExceptionsFilter());
  app.enableCors({
    origin: configService.get<string[]>('app.corsOrigins'),
    credentials: true,
  });

  // API Prefix
  const apiPrefix = configService.get<string>('app.apiPrefix') as string;
  app.setGlobalPrefix(apiPrefix);

  // Versioning
  // app.enableVersioning({
  //   type: VersioningType.URI,
  //   defaultVersion: '1',
  // });

  // Global Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global Filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global Interceptors
  app.useGlobalInterceptors(
    new TransformInterceptor(),
    new LoggingInterceptor(),
  );

  // Swagger Documentation
    const config = new DocumentBuilder()
      .setTitle('Makhdoom - Home Services Platform API')
      .setDescription('API documentation for Home Services Platform')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addTag('Auth', 'Authentication endpoints')
      .addTag('Users', 'User management')
      .addTag('Providers', 'Service provider management')
      .addTag('Services', 'Service catalog')
      .addTag('Bookings', 'Booking management')
      .addTag('Payments', 'Payment processing')
      .addTag('Reviews', 'Reviews and ratings')
      .addTag('Disputes', 'Dispute resolution')
      .addTag('Notifications', 'Notification management')
      .addTag('Chat', 'Real-time chat')
      .addTag('Admin', 'Admin operations')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  // Static file serving
  app.useStaticAssets('uploads', {
    prefix: '/uploads/',
  });

  // Graceful shutdown
  app.enableShutdownHooks();

  const port = configService.get<number>('app.port') || 3000;
  await app.listen(port);

  console.log(`
    🚀 Application is running on: http://localhost:${port}/${apiPrefix}
    📚 API Documentation: http://localhost:${port}/api/docs
    🌍 Environment: ${configService.get('app.nodeEnv')}
  `);
}

bootstrap();