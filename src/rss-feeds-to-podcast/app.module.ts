import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { RssFeedModule } from './rss-feed/rss-feed.module';

@Module({
  imports: [AppConfigModule, RssFeedModule],
})
export class AppModule {}
