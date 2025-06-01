import { Controller, Get } from '@nestjs/common';
import { TalkService } from './talk.service';

@Controller()
export class TalkController {
  constructor(private readonly talkService: TalkService) {}

  @Get()
  getHello(): string {
    return this.talkService.getHello();
  }
}
