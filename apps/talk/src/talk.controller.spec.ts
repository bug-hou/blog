import { Test, TestingModule } from '@nestjs/testing';
import { TalkController } from './talk.controller';
import { TalkService } from './talk.service';

describe('TalkController', () => {
  let talkController: TalkController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [TalkController],
      providers: [TalkService],
    }).compile();

    talkController = app.get<TalkController>(TalkController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(talkController.getHello()).toBe('Hello World!');
    });
  });
});
