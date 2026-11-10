import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Hệ Thống Quản Lý Cửa Hàng Điện Thoại iPhone API')
    .setDescription(
      'Tài liệu REST API cho Hệ thống Quản lý và Bán iPhone (Thành viên 2: Quản trị CSDL & Quản lý Danh mục, Sản phẩm)',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`Backend đang chạy tại: http://localhost:${port}/api`);
  console.log(`Swagger API Docs: http://localhost:${port}/api/docs`);
}

bootstrap();
