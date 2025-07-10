import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { RssFeedModule } from './rss-feed/rss-feed.module';
import { SegmentPickerModule } from './segment-picker/segment-picker.module';
import { ContentScraperModule } from './content-scraper/content-scraper.module';

@Module({
  imports: [
    AppConfigModule,
    ContentScraperModule,
    RssFeedModule,
    SegmentPickerModule,
  ],
})
export class AppModule {}
