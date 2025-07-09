export interface RssFeedItem {
  content: string;
  title: string;
}

export interface RssFeedData {
  title: string;
  items: RssFeedItem[];
}
