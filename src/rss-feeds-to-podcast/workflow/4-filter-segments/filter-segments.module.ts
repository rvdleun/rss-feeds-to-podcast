import { Module } from '@nestjs/common';
import { OutputModule } from '../../modules/output/output.module';
import { filterSegmentsCommand } from './filter-segments.command';
import { FilterSegmentsService } from './filter-segments.service';
import { LlmModule } from '../../modules/llm/llm.module';

@Module({
  exports: [FilterSegmentsService],
  imports: [LlmModule, OutputModule],
  providers: [filterSegmentsCommand, FilterSegmentsService],
})
export class FilterSegmentsModule {}
