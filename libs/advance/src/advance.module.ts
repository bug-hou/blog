import { Module } from '@nestjs/common';
import { AdvanceService } from './advance.service';
import { TextAnalysisModule } from './text-analysis/text-analysis.module';

@Module({
  providers: [AdvanceService],
  exports: [AdvanceService],
  imports: [TextAnalysisModule],
})
export class AdvanceModule { }
