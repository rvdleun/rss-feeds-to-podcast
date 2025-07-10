import { Injectable, Logger } from '@nestjs/common';
import { LlmService } from '../../modules/llm/llm.service';
import { OutputService } from '../../modules/output/output.service';
import { Segment } from '../../types/segment';
import { evaluateArticlePrompt } from './filter-segments.prompts';
import { z } from 'zod';
import { generateSegmentDescription } from '../../utils/segment';
import { DIVIDER } from '../../utils/console';

@Injectable()
export class FilterSegmentsService {
  #logger = new Logger(this.constructor.name);

  constructor(
    private llmService: LlmService,
    private outputService: OutputService,
  ) {}

  async filter() {
    this.#logger.log('Filtering segments');

    const segments =
      this.outputService.getDataFromDirectory<Segment>('segments');

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];

      this.#logger.log(
        `Examining segment ${generateSegmentDescription(segment)}`,
      );

      const { content } = segment;

      if (!content) {
        this.#logger.warn(`Segment has no content. Removing this segment.`);
        this.outputService.removeSegment(segment);
        continue;
      }

      const evaluation = await this.llmService.generateText<boolean>(
        evaluateArticlePrompt(segment),
        z.boolean(),
      );

      if (!evaluation) {
        this.#logger.warn(
          `Segment has been evaluated to not be suitable for a podcast. Removing this segment.`,
        );
        this.outputService.removeSegment(segment);
      }
      this.#logger.log(DIVIDER);
    }

    this.#logger.log('Segments filtered.');
  }
}
