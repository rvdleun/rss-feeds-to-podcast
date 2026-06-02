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
import { getAudioDurationInSeconds } from 'get-audio-duration';

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
      const audioFile = `${outputDirectory}/audio-${i}.mp3`;

      if (item.type === 'delay') {
        const { duration } = item as ScriptDelayItem;
        const durationSeconds = Math.max(0.05, duration / 1000);

        this.#logger.log(
          `[${i}/${total}] Generating silent audio file for ${durationSeconds} seconds...`,
        );
        execSync(
          `ffmpeg -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 -t ${durationSeconds} "${audioFile}" -y`,
        );
      } else if (item.type === 'host-speaks') {
        const { content, host } = item as ScriptHostSpeaksItem;

        const { voice } = hosts.find(({ id }) => id === host)!;

        this.#logger.log(
          `[${i}/${total}] Generating ${host} speech using ${voice}: ${content}`,
        );

        await this.textToSpeechService.generate(content, voice, audioFile);
      } else if (item.type === 'sfx') {
        const { src } = item as ScriptSfxItem;
        this.#logger.log(`[${i}/${total}] Setting up ${src} SFX...`);
        copyFileSync(`${assetsDirectory}/${src}.mp3`, audioFile);
      } else {
        this.#logger.log(`[${i}/${total}] Ignoring ${item.type} item.`);
        continue;
      }

      item.lengthAudio = await getAudioDurationInSeconds(audioFile) * 1000;
    }

    this.outputService.generateFile(
      '',
      'script.json',
      JSON.stringify(script, null, 2),
    );
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
      .filter(item => item.lengthAudio)
      .map((item) => `file ${outputDirectory}/audio-${item.id}.mp3`)
      .join('\n');
    this.outputService.generateFile('', 'concat-list.txt', concatListContent);

    this.#logger.log('Merging audio');
    execSync(
      `ffmpeg -f concat -safe 0 -i "${outputPath}/concat-list.txt" -c:a libmp3lame -b:a 128k "${outputPath}"/podcast.mp3 -y`,
    );

    this.#logger.log('Audio merged.');
  }
}
