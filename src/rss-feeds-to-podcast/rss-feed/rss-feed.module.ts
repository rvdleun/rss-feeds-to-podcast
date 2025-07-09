import { Module } from '@nestjs/common';
import { RssFeedService } from './rss-feed.service';
import { RssFeedCommand } from './rss-feed.command';
import { OutputModule } from '../output/output.module';
import { AppConfigModule } from '../config/config.module';

@Module({
  imports: [AppConfigModule, OutputModule],
  providers: [RssFeedCommand, RssFeedService],
})
export class RssFeedModule {}
