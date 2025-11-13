import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const PORT = process.env.PORT || 3000;
  const FRONT_URL =
    process.env.NODE_ENV === 'production'
      ? process.env.FRONTEND_URL_PROD
      : process.env.FRONTEND_URL_DEV;

  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Authorization')
    .setDescription('The authorization checker endpoints scan crop')
    .setVersion('1.0')
    .addTag('scan-crop')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.enableCors({
    origin: [FRONT_URL].filter(Boolean),
    credentials: true,
  });

  await app.listen(PORT);
  console.log(`Server is running on port ${PORT}`);
}
bootstrap();
