import { AppConfigService } from '../config/config.service';
import { TextToSpeechService } from './text-to-speech.service';
import { Module } from '@nestjs/common';

@Module({
  exports: [TextToSpeechService],
  imports: [AppConfigService],
  providers: [TextToSpeechService],
})
export class TextToSpeechModule {}
