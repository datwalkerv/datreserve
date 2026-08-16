import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({ origin: process.env.WEB_URL || 'http://localhost:3000', credentials: true });
  await app.listen(process.env.PORT || 3001);
  console.log(`API running on port ${process.env.PORT || 3001}`);
}
bootstrap();
