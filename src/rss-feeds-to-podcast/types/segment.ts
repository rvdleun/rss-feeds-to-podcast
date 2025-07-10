import { RssFeedItem } from './rss-feed.types';

export interface Segment {
  content?: string;
  fileName: string;
  item: RssFeedItem;
  origin: string;
  siteName?: string;
  summary?: string;
}
