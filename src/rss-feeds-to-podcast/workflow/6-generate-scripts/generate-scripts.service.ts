import { Injectable, Logger } from '@nestjs/common';
import { LlmService } from '../../modules/llm/llm.service';
import { AppConfigService } from '../../modules/config/config.service';
import { OutputService } from '../../modules/output/output.service';
import { Segment, SegmentScriptItem } from '../../types/segment';
import { generateSegmentScriptPrompt } from './generate-scripts.prompts';
import { z } from 'zod';
import { generateSegmentDescription } from '../../utils/segment';
import { DIVIDER } from '../../utils/console';

@Injectable()
export class GenerateScriptsService {
  #logger = new Logger(this.constructor.name);

  constructor(
    private appConfigService: AppConfigService,
    private llmService: LlmService,
    private outputService: OutputService,
  ) {}

  async generateScripts() {
    this.#logger.log('Generating scripts');

    const config = this.appConfigService.getConfig('podcast');
    const hostIds = config.hosts.map(({ id }) => id);

    const segments =
      this.outputService.getDataFromDirectory<Segment>('segments');

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      this.#logger.log(
        `Generating script for segment ${generateSegmentDescription(segment)}`,
      );

      segment.script = await this.llmService.generateText<SegmentScriptItem[]>(
        generateSegmentScriptPrompt(segment, config),
        z.array(
          z.object({
            // @ts-ignore
            host: z.enum(hostIds),
            content: z.string(),
          }),
        ),
      );

      if (!segment.script) {
        this.#logger.warn(`Script could not be generated`);
        continue;
      }

      this.#logger.log(`Script generated.`);
      this.#logger.log(DIVIDER);
      this.outputService.saveSegment(segment);
    }
  }
}
