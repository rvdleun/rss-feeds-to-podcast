import { Injectable, Logger } from '@nestjs/common';
import { LlmService } from '../../modules/llm/llm.service';
import { OutputService } from '../../modules/output/output.service';
import { Segment } from '../../types/segment';
import { generateSummaryPrompt } from './generate-summaries.prompts';
import { generateSegmentDescription } from '../../utils/segment';
import { DIVIDER } from '../../utils/console';

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

      this.#logger.log(
        `Generating summary for segment ${generateSegmentDescription(segment)}`,
      );

      if (!segment.content) {
        this.#logger.warn(`Segment has no content`);
        continue;
      }

      if (segment.summary) {
        this.#logger.warn(`Segment already has a summary`);
        continue;
      }

      const summary = await this.llmService.generateText(
        generateSummaryPrompt(segment),
      );
      this.#logger.log(`Summary generated`);

      segment.summary = summary;
      this.outputService.saveSegment(segment);
      this.#logger.log(DIVIDER);
    }

    this.#logger.log('Summaries generated.');
  }
}
