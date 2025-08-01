import { Module } from '@nestjs/common';
import { OssService } from './oss.service';
import { CommonModule } from '@app/common';

@Module({
  imports: [CommonModule],
  providers: [OssService],
  exports: [OssService],
})
export class OssModule { }
