import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TextAnalysisController } from './text-analysis.controller';
import { TextAnalysisService } from './text-analysis.service';
import { DocItem, DocItemSchema } from './doc-item.model';
import { DictWord, DictWordSchema } from './dict-word.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DocItem.name, schema: DocItemSchema },
      { name: DictWord.name, schema: DictWordSchema },
    ]),
  ],
  controllers: [TextAnalysisController],
  providers: [TextAnalysisService],
  exports: [TextAnalysisService],
})
export class TextAnalysisModule {}
