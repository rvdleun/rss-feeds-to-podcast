import { Injectable, Logger } from '@nestjs/common';
import { LlmService } from '../../modules/llm/llm.service';
import { AppConfigService } from '../../modules/config/config.service';
import { OutputService } from '../../modules/output/output.service';
import { Segment, SegmentScriptItem } from '../../types/segment';
import {
  generateIntroScriptPrompt,
  generateOutroScriptPrompt,
  generateSegmentScriptPrompt,
} from './generate-scripts.prompts';
import { z } from 'zod';
import { generateSegmentDescription } from '../../utils/segment';
import { DIVIDER } from '../../utils/console';
import {
  ScriptDelayItem,
  ScriptHostSpeaksItem,
  ScriptItem,
  ScriptSfxItem,
} from './generate-scripts.types';

type IntroOutroType = 'intro' | 'outro';

@Injectable()
export class GenerateScriptsService {
  #logger = new Logger(this.constructor.name);

  constructor(
    private appConfigService: AppConfigService,
    private llmService: LlmService,
    private outputService: OutputService,
  ) {}

  async generateFinalScript() {
    this.#logger.log('Generating final script');

    const script: ScriptItem[] = [
      {
        type: 'sfx',
        src: 'jingle',
      } as ScriptSfxItem,
      {
        type: 'delay',
        duration: 1000,
      } as ScriptDelayItem,
    ];

    const intro = this.outputService.getContent<SegmentScriptItem[]>(
      'intro-outtro',
      'intro.json',
    );
    script.push(...this.#segmentScriptItem(intro));
    script.push({
      type: 'sfx',
      src: 'new-segment',
    } as ScriptSfxItem);

    const segments =
      this.outputService.getDataFromDirectory<Segment>('segments');
    script.push(
      ...segments.map(({ script }) => this.#segmentScriptItem(script)).flat(),
      {
        type: 'sfx',
        src: 'new-segment',
      } as ScriptSfxItem,
    );

    const outro = this.outputService.getContent<SegmentScriptItem[]>(
      'intro-outtro',
      'outro.json',
    );
    script.push(...this.#segmentScriptItem(outro));
    script.push({
      type: 'sfx',
      src: 'jingle',
    } as ScriptSfxItem);

    this.outputService.generateFile(
      '',
      'script.json',
      JSON.stringify(script, null, 2),
    );
  }

  async generateIntroOutputScripts(type: IntroOutroType) {
    this.#logger.log(`Generating ${type} script`);

    const config = this.appConfigService.getConfig('podcast');

    const segments =
      this.outputService.getDataFromDirectory<Segment>('segments');
    const briefs = segments.map((segment) => segment.brief);

    const result = await this.llmService.generateText(
      type === 'intro'
        ? generateIntroScriptPrompt(briefs, config)
        : generateOutroScriptPrompt(briefs, config),
      this.#getScriptSchema(),
    );
    this.outputService.generateFile(
      'intro-outtro',
      `${type}.json`,
      JSON.stringify(result, null, 2),
    );

    this.#logger.log(`Script for ${type} generated.`);
  }

  async generateSegmentScripts() {
    this.#logger.log('Generating segment scripts');

    const config = this.appConfigService.getConfig('podcast');

    const segments =
      this.outputService.getDataFromDirectory<Segment>('segments');

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      this.#logger.log(
        `Generating script for segment ${generateSegmentDescription(segment)}`,
      );

      segment.script = await this.llmService.generateText<SegmentScriptItem[]>(
        generateSegmentScriptPrompt(segment, config),
        this.#getScriptSchema(),
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

  #getScriptSchema() {
    const config = this.appConfigService.getConfig('podcast');
    const hostIds = config.hosts.map(({ id }) => id);

    return z.array(
      z.object({
        // @ts-ignore
        host: z.enum(hostIds),
        content: z.string(),
      }),
    );
  }

  #segmentScriptItem(items: SegmentScriptItem[]): ScriptItem[] {
    return [
      ...items
        .map(({ host, content }) => [
          {
            content,
            host,
            type: 'host-speaks',
          } as ScriptHostSpeaksItem,
          {
            type: 'delay',
            duration: Math.floor(Math.random() * 100),
          } as ScriptDelayItem,
        ])
        .flat(),
    ];
  }
}
