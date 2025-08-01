import { NestFactory } from '@nestjs/core';
import { TalkModule } from './talk.module';
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import * as cros from "cors"
import { CustomValidationPipe } from '@app/common/custom-validator/custom-validator';

async function bootstrap() {
  const app = await NestFactory.create(TalkModule);

  app.setGlobalPrefix("/api/talk")

  app.use(cros())

  const config = new DocumentBuilder()
    .setTitle('blog talk service')
    .setDescription('The API description')
    .setVersion('1.0')
    .addTag('test')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, document);

  app.useGlobalPipes(new CustomValidationPipe({
    transform: true,
    whitelist: true,
    stopAtFirstError: true,
  }));
  await app.listen(process.env.TalkPort ?? 3000);
}
bootstrap();
