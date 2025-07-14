import { Module } from '@nestjs/common';
import { OutputModule } from '../../modules/output/output.module';
import { GenerateAudioService } from './generate-audio.service';
import {
  GenerateAudioCommand,
  MergeAudioCommand,
} from './generate-audio.command';
import { AppConfigModule } from '../../modules/config/config.module';
import { TextToSpeechModule } from 'src/rss-feeds-to-podcast/modules/text-to-speech/text-to-speech.module';

@Module({
  exports: [GenerateAudioService],
  imports: [AppConfigModule, OutputModule, TextToSpeechModule],
  providers: [GenerateAudioCommand, GenerateAudioService, MergeAudioCommand],
})
export class GenerateAudioModule {}
