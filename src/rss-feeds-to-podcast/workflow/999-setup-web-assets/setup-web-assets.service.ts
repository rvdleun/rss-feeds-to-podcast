import { Injectable, Logger } from '@nestjs/common';
import { LlmService } from '../../modules/llm/llm.service';
import { outputPath, OutputService } from '../../modules/output/output.service';
import { AppConfigService } from '../../modules/config/config.service';
import { Segment } from '../../types/segment';
import { generateDescriptionPrompt } from './setup-web-assets.prompts';
import { randomBytes } from 'crypto';
import { copyFileSync } from 'fs';
import { join } from 'path';
import {
  ScriptItem,
  ScriptStartSegmentItem,
} from '../6-generate-scripts/generate-scripts.types';

const webPath = join(process.cwd(), 'web');

@Injectable()
export class SetupWebAssetsService {
  #logger = new Logger(this.constructor.name);

  constructor(
    private appConfigService: AppConfigService,
    private llmService: LlmService,
    private outputService: OutputService,
  ) {}

  async generateDescription() {
    this.#logger.log('Updating web assets');

    this.#logger.log('Generating description');

    const podcastConfig = this.appConfigService.getConfig('podcast');
    const segments =
      this.outputService.getDataFromDirectory<Segment>('segments');

    const description = await this.llmService.generateText(
      generateDescriptionPrompt(podcastConfig, segments),
    );

    const script = this.outputService.getContent<ScriptItem[]>('', 'script.json');
    const dataSegments = [];
    let startTime = 0;

    for(let i = 0; i < script.length; i++) {
      const item = script[i];
      if (item.type === 'start-segment') {
        const { origin, src, title } = item as ScriptStartSegmentItem;
        dataSegments.push({
          origin,
          src,
          startTime,
          title,
        });
      } else {
        startTime += item.lengthAudio ?? 0;
      }
    }

    const data = {
      id: randomBytes(3).toString('hex'),
      name: podcastConfig.name,
      description,
      segments: dataSegments,
    };
    this.outputService.generateFile(
      '',
      'podcast.json',
      JSON.stringify(data, null, 2),
    );

    this.#logger.log('Description generated. Moving assets...');
    copyFileSync(`${outputPath}/podcast.json`, `${webPath}/podcast.json`);
    copyFileSync(`${outputPath}/podcast.mp3`, `${webPath}/podcast.mp3`);
  }
}
