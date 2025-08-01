import { Module } from '@nestjs/common';
import { ChaptersService } from './chapters.service';
import { ChaptersController } from './chapters.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chapters, ChapterWithVersion } from './entities/chapters.entity';
import { CommonModule } from '@app/common';
import { OssModule } from '@app/oss';
import { TextAnalysisModule } from '@app/advance/text-analysis/text-analysis.module';
import { AuthModule } from '@app/auth';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([Chapters, ChapterWithVersion]),
    CommonModule,
    OssModule,
    TextAnalysisModule,
  ],
  controllers: [ChaptersController],
  providers: [ChaptersService],
  exports: [ChaptersService]
})
export class ChaptersModule { }
