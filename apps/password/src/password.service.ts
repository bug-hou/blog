import { Injectable } from '@nestjs/common';

@Injectable()
export class PasswordService {
  getHello(): string {
    return 'Hello World!';
  }
}
