import { RssFeedItem } from './rss-feed.types';

export interface Segment {
  content?: string;
  item: RssFeedItem;
  origin: string;
  siteName?: string;
  summary?: string;
}
