import { NestFactory } from '@nestjs/core';
import { TalkModule } from './talk.module';

async function bootstrap() {
  const app = await NestFactory.create(TalkModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
