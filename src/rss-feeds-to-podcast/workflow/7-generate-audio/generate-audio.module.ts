import { Module } from '@nestjs/common';
import { OutputModule } from '../../modules/output/output.module';
import { GenerateAudioService } from './generate-audio.service';
import { GenerateAudioCommand } from './generate-audio.command';
import { AppConfigModule } from '../../modules/config/config.module';

@Module({
  imports: [AppConfigModule, OutputModule],
  providers: [GenerateAudioCommand, GenerateAudioService],
})
export class GenerateAudioModule {}
