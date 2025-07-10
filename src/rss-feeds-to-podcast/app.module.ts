import { Module } from '@nestjs/common';
import { RssFeedModule } from './workflow/1-rss-feed/rss-feed.module';
import { SegmentPickerModule } from './workflow/2-segment-picker/segment-picker.module';
import { ContentScraperModule } from './workflow/3-content-scraper/content-scraper.module';
import { GenerateSummariesModule } from './workflow/4-generate-summaries/generate-summaries.module';

@Module({
  imports: [
    RssFeedModule,
    SegmentPickerModule,
    ContentScraperModule,
    GenerateSummariesModule,
  ],
})
export class AppModule {}
