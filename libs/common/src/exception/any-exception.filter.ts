import { ArgumentsHost, Catch, ExceptionFilter, Inject } from '@nestjs/common';
import { CustomError } from '../custom-error/custom-error';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Request, Response } from 'express';
import { UUIDHeaderName } from '../config/const.config';
import { ErrorData } from '../config/error.config';

@Catch(CustomError)
export class AnyExceptionFilter<T> implements ExceptionFilter {
  @Inject(WINSTON_MODULE_PROVIDER)
  private readonly logger: Logger;

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const { code, message, ...others } = exception.response
    const requestId = request.headers[UUIDHeaderName];
    const responseData = {
      requestId,
      code,
      body: request.body,
      query: request.query,
      params: request.params,
      headers: request.headers,
      url: request.url,
      ...others
    }

    this.logger.error({
      ...responseData,
    })

    response.status(code).json({
      error: exception.response,
      requestId,
      code,
    });
  }
}
