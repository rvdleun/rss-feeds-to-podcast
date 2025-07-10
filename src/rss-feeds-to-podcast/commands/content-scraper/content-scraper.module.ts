import { ContentScraperService } from './content-scraper.service';
import { ContentScraperCommand } from './content-scraper.command';
import { Module } from '@nestjs/common';
import { AppConfigModule } from '../../modules/config/config.module';
import { OutputModule } from '../../modules/output/output.module';

@Module({
  imports: [AppConfigModule, OutputModule],
  providers: [ContentScraperCommand, ContentScraperService],
})
export class ContentScraperModule {}
