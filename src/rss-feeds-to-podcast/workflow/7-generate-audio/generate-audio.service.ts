import { Injectable, Logger } from '@nestjs/common';
import { outputPath, OutputService } from '../../modules/output/output.service';
import {
  ScriptDelayItem,
  ScriptHostSpeaksItem,
  ScriptItem,
  ScriptSfxItem,
} from '../6-generate-scripts/generate-scripts.types';
import { copyFileSync, createWriteStream, existsSync, mkdirSync } from 'fs';
import { configPath } from '../../modules/config/config.loader';
import { join } from 'path';
import { AppConfigService } from '../../modules/config/config.service';
import { execSync } from 'child_process';
import { TextToSpeechService } from '../../modules/text-to-speech/text-to-speech.service';

@Injectable()
export class GenerateAudioService {
  #logger = new Logger(this.constructor.name);

  constructor(
    private appConfigService: AppConfigService,
    private outputService: OutputService,
    private textToSpeechService: TextToSpeechService,
  ) {}

  async generateAudioFiles() {
    const assetsDirectory = join(configPath, 'assets');
    const { hosts } = this.appConfigService.getConfig('podcast');
    const outputDirectory = join(outputPath, 'audio');
    const script = this.outputService.getContent<ScriptItem[]>(
      '',
      'script.json',
    );
    const total = script.length;

    if (!existsSync(outputDirectory)) {
      mkdirSync(outputDirectory, { recursive: true });
    }

    this.#logger.log('Generating audio files');

    for (let i = 0; i < script.length; i++) {
      const item = script[i];

      if (item.type === 'delay') {
        const { duration } = item as ScriptDelayItem;
        const silentFile = `${outputDirectory}/audio-${i}.mp3`;
        const durationSeconds = Math.max(0.05, duration / 1000);

        this.#logger.log(
          `[${i}/${total}] Generating silent audio file for ${durationSeconds} seconds...`,
        );
        execSync(
          `ffmpeg -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 -t ${durationSeconds} "${silentFile}" -y`,
        );
      } else if (item.type === 'host-speaks') {
        const { content, host } = item as ScriptHostSpeaksItem;

        const { voice } = hosts.find(({ id }) => id === host)!;

        this.#logger.log(
          `[${i}/${total}] Generating ${host} speech using ${voice}: ${content}`,
        );

        await this.textToSpeechService.generate(
          content,
          voice,
          `${outputDirectory}/audio-${i}.mp3`,
        );
      } else if (item.type === 'sfx') {
        const { src } = item as ScriptSfxItem;
        this.#logger.log(`[${i}/${total}] Setting up ${src} SFX...`);
        copyFileSync(
          `${assetsDirectory}/${src}.mp3`,
          `${outputDirectory}/audio-${i}.mp3`,
        );
      } else {
        this.#logger.log(`[${i}/${total}] Ignoring ${item.type} item.`);
      }
    }
  }

  mergeAudioFiles() {
    const outputDirectory = join(outputPath, 'audio');
    const script = this.outputService.getContent<ScriptItem[]>(
      '',
      'script.json',
    );

    this.#logger.log('Merging audio files');

    this.#logger.log('Generating concat-list.txt');
    const concatListContent = script
      .map((_, i) => `file ${outputDirectory}/audio-${i}.mp3`)
      .join('\n');
    this.outputService.generateFile('', 'concat-list.txt', concatListContent);

    this.#logger.log('Merging audio');
    execSync(
      `ffmpeg -f concat -safe 0 -i "${outputPath}/concat-list.txt" -c:a libmp3lame -b:a 128k "${outputPath}"/podcast.mp3 -y`,
    );

    this.#logger.log('Audio merged.');
  }
}
