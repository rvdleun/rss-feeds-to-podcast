import { Module } from '@nestjs/common';
import { AppConfigModule } from './modules/config/config.module';
import { RssFeedModule } from './workflow/1-rss-feed/rss-feed.module';
import { SegmentPickerModule } from './workflow/2-segment-picker/segment-picker.module';
import { ContentScraperModule } from './workflow/3-content-scraper/content-scraper.module';

@Module({
  imports: [RssFeedModule, SegmentPickerModule, ContentScraperModule],
})
export class AppModule {}
