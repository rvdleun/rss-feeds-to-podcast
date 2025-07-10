import { Module } from '@nestjs/common';
import { RssFeedModule } from './workflow/1-rss-feed/rss-feed.module';
import { SegmentPickerModule } from './workflow/2-segment-picker/segment-picker.module';
import { ContentScraperModule } from './workflow/3-content-scraper/content-scraper.module';
import { GenerateSummariesModule } from './workflow/5-generate-summaries/generate-summaries.module';
import { FilterSegmentsModule } from './workflow/4-filter-segments/filter-segments.module';

@Module({
  imports: [
    RssFeedModule,
    SegmentPickerModule,
    ContentScraperModule,
    FilterSegmentsModule,
    GenerateSummariesModule,
  ],
})
export class AppModule {}
