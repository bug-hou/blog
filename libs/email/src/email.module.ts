import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { CommonModule } from '@app/common';

@Module({
  imports: [CommonModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule { }
