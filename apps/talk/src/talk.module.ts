import { Module } from '@nestjs/common';
import { TalkController } from './talk.controller';
import { TalkService } from './talk.service';

@Module({
  imports: [],
  controllers: [TalkController],
  providers: [TalkService],
})
export class TalkModule {}
