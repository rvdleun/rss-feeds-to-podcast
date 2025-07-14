import { AppConfigModule } from '../config/config.module';
import { WebScraperService } from './web-scraper.service';
import { Module } from '@nestjs/common';

@Module({
  exports: [WebScraperService],
  imports: [AppConfigModule],
  providers: [WebScraperService],
})
export class WebScraperModule {}
