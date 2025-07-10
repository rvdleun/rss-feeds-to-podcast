import { Injectable, Logger } from '@nestjs/common';
import { OutputService } from '../../modules/output/output.service';
import { RssFeedData } from '../../types/rss-feed.types';
import { AppConfigService } from '../../modules/config/config.service';
import { Segment } from '../../types/segment';
import { randomBytes } from 'crypto';
import { DIVIDER } from '../../utils/console';

@Injectable()
export class SegmentPickerService {
  #logger = new Logger(this.constructor.name);

  constructor(
    private appConfigService: AppConfigService,
    private outputService: OutputService,
  ) {}

  public async createSegments() {
    this.#logger.log('Creating and picking segments');

    const rssFeeds =
      this.outputService.getDataFromDirectory<RssFeedData>('rss-feeds');

    if (rssFeeds.length === 0) {
      this.#logger.warn('No RSS Feeds found. Run "retrieve-rss-feeds" first');
      return;
    }

    let segmentsLeft =
      this.appConfigService.getConfig('podcast').numberOfSegments;
    const segments: Segment[] = [];

    while (segmentsLeft > 0) {
      this.#logger.log(`Creating segment ${segments.length + 1}`);

      const feed = rssFeeds[Math.floor(Math.random() * rssFeeds.length)];
      this.#logger.debug(`Using feed ${feed.title}`);

      if (feed.items.length === 0) {
        this.#logger.warn(`Feed ${feed.title} has no items`);
        continue;
      }

      const item = feed.items[Math.floor(Math.random() * feed.items.length)];

      if (!item) {
        this.#logger.warn(`No item found in feed ${feed.title}`);
        continue;
      }

      if (segments.some((segment) => segment.item.id === item.id)) {
        this.#logger.warn(`Item ${item.id} already selected`);
        continue;
      }

      const segment = {
        id: randomBytes(3).toString('hex'),
        item,
        origin: feed.title,
      };
      segments.push(segment);

      this.outputService.saveSegment(segment);
      segmentsLeft--;

      this.#logger.log(DIVIDER);
    }

    this.#logger.log('Segments picked.');
  }
}
