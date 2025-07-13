import { Module } from '@nestjs/common';
import { OutputModule } from '../../modules/output/output.module';
import { GenerateAudioService } from './generate-audio.service';
import {
  GenerateAudioCommand,
  MergeAudioCommand,
} from './generate-audio.command';
import { AppConfigModule } from '../../modules/config/config.module';

@Module({
  exports: [GenerateAudioService],
  imports: [AppConfigModule, OutputModule],
  providers: [GenerateAudioCommand, GenerateAudioService, MergeAudioCommand],
})
export class GenerateAudioModule {}
