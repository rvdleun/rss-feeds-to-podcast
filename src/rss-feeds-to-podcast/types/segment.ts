import { RssFeedItem } from './rss-feed.types';

export interface Segment {
  brief?: string;
  content?: string;
  id: string;
  item: RssFeedItem;
  origin: string;
  siteName?: string;
  summary?: string;
}
