import { GenerateSummariesCommand } from './generate-summaries.command';
import { GenerateSummariesService } from './generate-summaries.service';
import { Module } from '@nestjs/common';
import { LlmModule } from '../../modules/llm/llm.module';
import { OutputModule } from '../../modules/output/output.module';

@Module({
  imports: [LlmModule, OutputModule],
  providers: [GenerateSummariesCommand, GenerateSummariesService],
})
export class GenerateSummariesModule {}
