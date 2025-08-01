import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CommonService } from './common.service';
import { ConfigModule } from '@nestjs/config';
import { config } from './config/env.config';
import { MongooseModule } from '@nestjs/mongoose';
import { WinstonModule } from 'nest-winston';
import { loggerConfig } from './config/logger.config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AnyExceptionFilter } from './exception/any-exception.filter';
import { TransformInterceptor } from './transform/transform.interceptor';
import { PreRequestMiddleware } from './pre-request/pre-request.middleware';
import { CacheInterceptor } from './cache/cache.interceptor';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    WinstonModule.forRoot(loggerConfig),
    ConfigModule.forRoot<any>({
      isGlobal: true,
      envFilePath: '.env',
      load: [config],
    }),
    MongooseModule.forRoot(process.env.mongoPath),
    EventEmitterModule.forRoot({
      delimiter: '.', // optional; defualt '.'
    }),
  ],
  providers: [
    CommonService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor, // Assuming CacheInterceptor is defined in the same file or imported
    },
    {
      provide: APP_FILTER,
      useClass: AnyExceptionFilter
    }
  ],
  exports: [CommonService],
})
export class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PreRequestMiddleware).forRoutes('*');
  }
}
