import { Injectable, Logger } from '@nestjs/common';
import { LlmService } from '../../modules/llm/llm.service';
import { OutputService } from '../../modules/output/output.service';
import { Segment } from '../../types/segment';
import { generateSummaryPrompt } from './generate-summaries.prompts';

@Injectable()
export class GenerateSummariesService {
  #logger = new Logger(this.constructor.name);

  constructor(
    private llmService: LlmService,
    private outputService: OutputService,
  ) {}

  async generateSummaries() {
    this.#logger.log('Generating summaries');

    const segments =
      this.outputService.getDataFromDirectory<Segment>('segments');

    if (segments.length === 0) {
      this.#logger.warn(
        'No segments found. Run "create-segments" and "scrape-content" first',
      );
      return;
    }

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];

      if (!segment.content) {
        this.#logger.warn(`Segment ${i + 1} has no content`);
        continue;
      }

      if (segment.summary) {
        this.#logger.warn(`Segment ${i + 1} already has a summary`);
        continue;
      }

      const summary = await this.llmService.generateText(
        generateSummaryPrompt(segment),
      );
      this.#logger.log(`Summary for segment ${i + 1} generated`);

      segment.summary = summary;
      this.outputService.saveSegment(segment);
    }

    this.#logger.log('Summaries generated.');
  }
}
