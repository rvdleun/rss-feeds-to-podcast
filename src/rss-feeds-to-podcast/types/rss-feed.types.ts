export interface RssFeedItem {
  content: string;
  id: string;
  title: string;
}

export interface RssFeedData {
  items: RssFeedItem[];
  title: string;
}
