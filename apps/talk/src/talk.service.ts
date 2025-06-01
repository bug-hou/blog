import { Injectable } from '@nestjs/common';

@Injectable()
export class TalkService {
  getHello(): string {
    return 'Hello World!';
  }
}
