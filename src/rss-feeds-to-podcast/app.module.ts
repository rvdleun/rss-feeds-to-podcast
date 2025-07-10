import { Module } from '@nestjs/common';
import { AppConfigModule } from './modules/config/config.module';
import { RssFeedModule } from './commands/rss-feed/rss-feed.module';
import { SegmentPickerModule } from './commands/segment-picker/segment-picker.module';
import { ContentScraperModule } from './commands/content-scraper/content-scraper.module';

@Module({
  imports: [RssFeedModule, SegmentPickerModule, ContentScraperModule],
})
export class AppModule {}
