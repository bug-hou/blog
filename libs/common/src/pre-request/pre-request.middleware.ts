import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { UUIDHeaderName } from '../config/const.config';

@Injectable()
export class PreRequestMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    const uuid = uuidv4();
    req.headers[UUIDHeaderName] = uuid;
    next();
  }
}
