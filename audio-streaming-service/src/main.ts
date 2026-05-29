import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,

      // strips unknown properties
      forbidNonWhitelisted: true,

      // transforms payloads to DTO instances
      transform: true,

      // auto convert primitive types
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
