import { Injectable, Logger } from '@nestjs/common';
import { LlmService } from '../../modules/llm/llm.service';
import { AppConfigService } from '../../modules/config/config.service';
import { OutputService } from '../../modules/output/output.service';
import { Segment, SegmentScriptItem } from '../../types/segment';
import {
  generateIntroScriptPrompt,
  generateOutroScriptPrompt,
  generateSegmentScriptPrompt,
  generateSegmentScriptStartValidationPrompt,
  generateSegmentScriptValidationPrompt,
} from './generate-scripts.prompts';
import { z } from 'zod';
import { generateSegmentDescription } from '../../utils/segment';
import { DIVIDER } from '../../utils/console';
import {
  EvaluateArticleResponseFormat,
  ScriptDelayItem,
  ScriptHostSpeaksItem,
  ScriptItem,
  ScriptSfxItem,
  ScriptStartSegmentItem,
} from './generate-scripts.types';
import { PodcastConfig } from '../../modules/config/schemas/podcast.schema';

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

    const script: ScriptItem[] = [];

    const intro = this.outputService.getContent<SegmentScriptItem[]>(
      'intro-outtro',
      'intro.json',
    );
    script.push(...[
      {
        type: 'delay',
        duration: 100 + Math.floor(Math.random() * 300),
      } as ScriptDelayItem,...this.#segmentScriptItem(intro),
      {
        type: 'sfx',
        src: 'jingle',
      } as ScriptSfxItem,
      {
        type: 'delay',
        duration: 1000,
      } as ScriptDelayItem,
    ]);
    script.push({
      type: 'sfx',
      src: 'new-segment',
    } as ScriptSfxItem);
    script.push({
      type: 'delay',
      duration: 1000 + Math.floor(Math.random() * 100),
    } as ScriptDelayItem);

    const segments =
      this.outputService.getDataFromDirectory<Segment>('segments');
    script.push(
      ...segments
        .map(({ script, item: { src, title }, siteName }) => [
          {
            type: 'start-segment',
            origin: siteName,
            src,
            title,
          } as ScriptStartSegmentItem,
          ...this.#segmentScriptItem(script),
          {
            type: 'sfx',
            src: 'new-segment',
          } as ScriptSfxItem,
          {
            type: 'delay',
            duration: 1000 + Math.floor(Math.random() * 100),
          } as ScriptDelayItem,
        ])
        .flat(),
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

    script.forEach((item, index) => {
      item.id = index;
    });

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

    if (type === 'intro') {
      await this.#generateIntroScript(briefs, config);
    } else {
      await this.#generateOutroScript(briefs, config);
    }
  }

  async generateSegmentScripts() {
    this.#logger.log('Generating segment scripts');

    const config = this.appConfigService.getConfig('podcast');

    const segments =
      this.outputService.getDataFromDirectory<Segment>('segments');

    let attempts = 0;
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      this.#logger.log(
        `Generating script for segment ${generateSegmentDescription(segment)}`,
      );

      segment.script = await this.#generateScript(
        generateSegmentScriptPrompt(segment, config),
      );

      if (!segment.script) {
        this.#logger.warn(`Script could not be generated`);
        continue;
      }

      const firstLine = segment.script[0].content;

      this.#logger.log(`Validating first line: ${firstLine}`);

      const validateStart =
        await this.llmService.generateText<EvaluateArticleResponseFormat>(
          generateSegmentScriptStartValidationPrompt(firstLine), z.object({
            isValid: z.boolean(),
            reason: z.string(),
          }),
        );

      if (!validateStart.isValid) {
        this.#logger.warn(`First line validation failed: ${validateStart.reason}`);

        attempts++;
        if (attempts < 5) {
          i--;
        }
        continue;
      }

      this.#logger.log(`First line validation passed.`);

      this.#logger.log(`Validating entire script.`);
      const validateScript =
        await this.llmService.generateText<EvaluateArticleResponseFormat>(
          generateSegmentScriptValidationPrompt(segment.script.map(line => line.content)),
          z.object({
            isValid: z.boolean(),
            reason: z.string(),
          }),
        );

      if (!validateScript.isValid) {
        this.#logger.warn(`Validation failed: ${validateScript.reason}`);

        attempts++;
        if (attempts < 5) {
          i--;
        }
        continue;
      }

      this.#logger.log(`Script generated.`);
      this.#logger.log(DIVIDER);
      this.outputService.saveSegment(segment);
    }
  }

  async #generateIntroScript(briefs: string[], config: PodcastConfig) {
    const host = config.hosts.sort(() => Math.random() - 0.5)[0];
    const prompt = generateIntroScriptPrompt(briefs, config, host);
    const content = await this.llmService.generateText(prompt);
    this.outputService.generateFile(
      'intro-outtro',
      `intro.json`,
      JSON.stringify([{ host: host.id, content}], null, 2),
    );

    this.#logger.log(`Script for intro generated.`);
  }

  async #generateOutroScript(briefs: string[], config: PodcastConfig) {
    const result = await this.#generateScript(
      generateOutroScriptPrompt(briefs, config),
    );
    this.outputService.generateFile(
      'intro-outtro',
      `outro.json`,
      JSON.stringify(result, null, 2),
    );

    this.#logger.log(`Script for outro generated.`);
  }

  async #generateScript(prompt: string) {
    const request = await this.llmService.generateText<{
      result?: SegmentScriptItem[];
    }>(prompt, this.#getScriptSchema());

    if (!request.result) {
      this.#logger.error('No result from LLM');
      throw new Error('No result from LLM');
    }

    return request.result;
  }

  #getScriptSchema() {
    const config = this.appConfigService.getConfig('podcast');
    const hostIds = config.hosts.map(({ id }) => id);

    return z.object({
      result: z.array(
        z.object({
          // @ts-ignore
          host: z.enum(hostIds),
          content: z.string(),
        }),
      ),
    });
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
