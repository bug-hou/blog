import { NestFactory } from '@nestjs/core';
import { PasswordModule } from './password.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { PreRequestMiddleware } from '@app/common/pre-request/pre-request.middleware';

async function bootstrap() {
  const app = await NestFactory.create(PasswordModule);

  app.setGlobalPrefix("/api/user/")

  const config = new DocumentBuilder()
    .setTitle('blog talk service')
    .setDescription('The API description')
    .setVersion('1.0')
    .addTag('test')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, document);

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PasswordPort);
}
bootstrap();
