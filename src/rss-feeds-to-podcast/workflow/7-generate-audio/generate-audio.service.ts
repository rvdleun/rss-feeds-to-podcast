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
import { ConfigService } from '@nestjs/config';
import { ExternalServicesConfig } from '../../modules/config/schemas/external-services.schema';
import { AppConfigService } from '../../modules/config/config.service';
import { pipeline } from 'stream/promises';
import { execSync } from 'child_process';

@Injectable()
export class GenerateAudioService {
  #logger = new Logger(this.constructor.name);

  constructor(
    private appConfigService: AppConfigService,
    private outputService: OutputService,
  ) {}

  async generateAudioFiles() {
    const assetsDirectory = join(configPath, 'assets');
    const { hosts } = this.appConfigService.getConfig('podcast');
    const { href: fastKokoHref } =
      this.appConfigService.getConfig('externalServices').fastKoko;
    const outputDirectory = join(outputPath, 'audio');
    const script = this.outputService.getContent<ScriptItem[]>(
      '',
      'script.json',
    );

    if (!existsSync(outputDirectory)) {
      mkdirSync(outputDirectory, { recursive: true });
    }

    this.#logger.log('Generating audio files');

    for (let i = 0; i < script.length; i++) {
      const item = script[i];

      if (item.type === 'delay') {
        const { duration } = item as ScriptDelayItem;
        const silentFile = `${outputDirectory}/audio-${i}.mp3`;
        const durationSeconds = duration / 1000;

        this.#logger.log(
          `\[${i}\] Generating silent audio file for ${durationSeconds} seconds...`,
        );
        execSync(
          `ffmpeg -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 -t ${durationSeconds} "${silentFile}" -y`,
        );
      } else if (item.type === 'host-speaks') {
        const { content, host } = item as ScriptHostSpeaksItem;

        const { voice } = hosts.find(({ id }) => id === host)!;

        this.#logger.log(
          `\[${i}\] Generating ${host} speech using ${voice}: ${content}`,
        );

        const response = await fetch(`${fastKokoHref}/v1/audio/speech`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            download_format: 'mp3',
            input: content,
            response_format: 'mp3',
            return_download_link: true,
            speed: 1,
            stream: true,
            voice,
          }),
        });

        const fileStream = createWriteStream(
          `${outputDirectory}/audio-${i}.mp3`,
        );

        // Use pipeline to handle streaming and error management
        await pipeline(response.body, fileStream);
      } else if (item.type === 'sfx') {
        const { src } = item as ScriptSfxItem;
        this.#logger.log(`\[${i}\] Setting up ${src} SFX...`);
        copyFileSync(
          `${assetsDirectory}/${src}.mp3`,
          `${outputDirectory}/audio-${i}.mp3`,
        );
      } else {
        this.#logger.log(`\[${i}\] Ignoring ${item.type} item.`);
      }
    }
  }
}
