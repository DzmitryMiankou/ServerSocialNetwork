import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {});

  const configService = app.get<ConfigService>(ConfigService);
  app.enableCors({
    credentials: true,
    origin: configService.get<string>(`CORS_ADRES`),
  });
  app.useStaticAssets(join(__dirname, '..', 'dist/public'));
  app.setBaseViewsDir(join(__dirname, '..', 'dist/views'));
  app.setViewEngine('hbs');
  app.use(cookieParser());
  await app.listen(+configService.get<number>(`PORT_SERVER`));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
}
bootstrap();
