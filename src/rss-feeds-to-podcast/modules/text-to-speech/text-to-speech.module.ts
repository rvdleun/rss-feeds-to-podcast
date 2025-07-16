import { TextToSpeechService } from './text-to-speech.service';
import { Module } from '@nestjs/common';
import { AppConfigModule } from '../config/config.module';

@Module({
  exports: [TextToSpeechService],
  imports: [AppConfigModule],
  providers: [TextToSpeechService],
})
export class TextToSpeechModule {}
