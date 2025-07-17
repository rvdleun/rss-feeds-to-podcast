import { Module } from '@nestjs/common';
import { RssFeedModule } from './workflow/1-rss-feed/rss-feed.module';
import { SegmentPickerModule } from './workflow/2-segment-picker/segment-picker.module';
import { ContentScraperModule } from './workflow/3-content-scraper/content-scraper.module';
import { GenerateSummariesModule } from './workflow/5-generate-summaries/generate-summaries.module';
import { FilterSegmentsModule } from './workflow/4-filter-segments/filter-segments.module';
import { GenerateScriptsModule } from './workflow/6-generate-scripts/generate-scripts.module';
import { GenerateAudioModule } from './workflow/7-generate-audio/generate-audio.module';
import { AppCommand, ConfirmationQuestion } from './app.command';
import { AppConfigModule } from './modules/config/config.module';
import { OutputModule } from './modules/output/output.module';
import { LlmModule } from './modules/llm/llm.module';
import { WebScraperModule } from './modules/web-scraper/web-scraper.module';
import { TextToSpeechModule } from './modules/text-to-speech/text-to-speech.module';
import { SetupWebAssetsModule } from './workflow/999-setup-web-assets/setup-web-assets.module';

@Module({
  imports: [
    AppConfigModule,
    LlmModule,
    OutputModule,
    TextToSpeechModule,
    WebScraperModule,

    RssFeedModule,
    SegmentPickerModule,
    ContentScraperModule,
    FilterSegmentsModule,
    GenerateSummariesModule,
    GenerateScriptsModule,
    GenerateAudioModule,

    SetupWebAssetsModule,
  ],
  providers: [AppCommand, ConfirmationQuestion],
})
export class AppModule {}
