import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // All routes are served under /api (keeps the public surface tidy).
  app.setGlobalPrefix('api');

  // Allow the Next.js frontend to call the API from the browser.
  const origins = config.get<string>('CORS_ORIGIN')?.split(',').map((o) => o.trim());
  app.enableCors({
    origin: origins && origins.length ? origins : true,
    credentials: true,
  });

  // Validate + transform every incoming request body against its DTO.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip properties not declared in the DTO
      forbidNonWhitelisted: true, // 400 if unknown properties are sent
      transform: true, // convert payloads to their DTO class instances
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const port = config.get<number>('PORT') ?? 4000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`🚀 Pyramid API running on http://localhost:${port}/api`);
}

bootstrap();
