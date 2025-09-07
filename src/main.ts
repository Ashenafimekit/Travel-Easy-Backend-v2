import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { ConsoleLogger, ValidationPipe, VersioningType } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AllExceptionFilter } from './common/filters/all-exception.filter';
import {
  PrismaExceptionFilter,
  PrismaUnknownExceptionFilter,
} from './common/filters/prisma-exception.filter';
import { PrismaValidationErrorFilter } from './common/filters/prisma-validation-error.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({ prefix: 'Travel-Easy' }),
  });
  app.use(cookieParser());
  app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
  app.useGlobalFilters(
    new HttpExceptionFilter(),
    new AllExceptionFilter(),
    new PrismaExceptionFilter(),
    new PrismaUnknownExceptionFilter(),
    new PrismaValidationErrorFilter(),
  );
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '2',
  });
  await app.listen(process.env.PORT ?? 3333);
}
void bootstrap();
