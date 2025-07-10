import { Module } from '@nestjs/common';
import { LlmService } from './llm.service';
import { AppConfigModule } from '../config/config.module';

@Module({
  exports: [LlmService],
  imports: [AppConfigModule],
  providers: [LlmService],
})
export class LlmModule {}
