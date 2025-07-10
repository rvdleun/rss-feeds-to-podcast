import { Injectable } from '@nestjs/common';
import { LlmService } from '../../modules/llm/llm.service';

@Injectable()
export class GenerateSummariesService {
  constructor(private llmService: LlmService) {}

  async generateSummaries() {
    return await this.llmService.generateText('Hello world!');
  }
}
