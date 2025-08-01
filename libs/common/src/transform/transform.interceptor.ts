import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from '@nestjs/common';
import { Request } from 'express';
import { catchError, map, Observable, tap, throwError, timeout, TimeoutError as ITimeoutError } from 'rxjs';
import { UUIDHeaderName } from '../config/const.config';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { CustomError } from '../custom-error/custom-error';
import { TimeoutError } from '../config/error.config';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  @Inject(WINSTON_MODULE_PROVIDER)
  private readonly logger: Logger;
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    return next.handle().pipe(
      timeout(30000),
      map(data => {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest<Request>();

        const requestId = request.headers[UUIDHeaderName] || '';
        if (data.code && data.code !== 200 && data.errorType) {
          throw new CustomError(data);
        }
        return { data, requestId, code: 200 };
      }),
      tap((data) => {
        const end = Date.now();
        this.logger.info({
          ...data,
          duration: end - now,
        });
        return data;
      }),
      catchError(err => {
        if (err instanceof ITimeoutError) {
          return throwError(() => new CustomError(TimeoutError));
        }
        return throwError(() => err);
      })
    );
  }
}
