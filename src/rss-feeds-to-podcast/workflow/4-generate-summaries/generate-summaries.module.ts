import { GenerateSummariesCommand } from './generate-summaries.command';
import { GenerateSummariesService } from './generate-summaries.service';
import { Module } from '@nestjs/common';
import { LlmModule } from '../../modules/llm/llm.module';

@Module({
  imports: [LlmModule],
  providers: [GenerateSummariesCommand, GenerateSummariesService],
})
export class GenerateSummariesModule {}
