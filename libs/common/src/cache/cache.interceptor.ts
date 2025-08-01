import { RedisService } from '@app/redis';
import { CallHandler, CanActivate, ExecutionContext, Inject, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable, tap } from 'rxjs';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  @Inject(Reflector)
  private readonly reflector: Reflector;
  @Inject(RedisService)
  private readonly redisService: RedisService;
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const enableCache = this.reflector.getAllAndOverride('enable:cache', [
      context.getHandler(),
    ]);
    if (!enableCache) {
      return next.handle();
    }
    const cacheName = this.reflector.getAllAndOverride('enableName', [
      context.getHandler(),
    ]);

    const onlyUpdateCache = this.reflector.getAllAndOverride('onlyUpdateCache', [
      context.getHandler(),
    ]);
    const cacheExpire = this.reflector.getAllAndOverride('cacheExpire', [
      context.getHandler(),
    ]);
    const cacheKeys = this.reflector.getAllAndOverride('dynamicName', [
      context.getHandler(),
    ]);
    const cacheOptions = this.reflector.getAllAndOverride('dynamicOptions', [
      context.getHandler(),
    ]);
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    let name = cacheName;
    if (cacheKeys && cacheKeys.length > 0) {
      cacheKeys.forEach((key: string) => {
        const data = request[key];
        for (const option of cacheOptions[key]) {
          const value = data?.[option];
          if (value === undefined || value === null) {
            return next.handle();
          }
          name += `_${option}:${value}`;
        }
      });
    }
    if (!onlyUpdateCache) {
      const data = await this.redisService.jsonGet(name);
      if (data) {
        return new Observable((observer) => {
          observer.next(data);
          observer.complete();
        });
      }
    }
    return next.handle().pipe(
      tap(async (data) => {
        await this.redisService.jsonSet(name, data, cacheExpire);
      })
    );
  }
}
