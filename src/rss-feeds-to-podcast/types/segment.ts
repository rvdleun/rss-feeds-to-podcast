import { RssFeedItem } from './rss-feed.types';

export interface SegmentScriptItem {
  host?: string;
  content?: string;
}

export interface Segment {
  brief?: string;
  content?: string;
  id: string;
  item: RssFeedItem;
  origin: string;
  script?: SegmentScriptItem[];
  siteName?: string;
  summary?: string;
}
