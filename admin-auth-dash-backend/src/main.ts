import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  
  // Enable CORS
  app.enableCors();
  
  await app.listen(3333);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
