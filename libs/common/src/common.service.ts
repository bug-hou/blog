import { Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class CommonService {
  getRealIP(request: Request) {
    // 按优先级提取 IP
    const ip = request.headers['x-forwarded-for'] ||
      request.ip ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress || '';
    return ip;
  }
}
