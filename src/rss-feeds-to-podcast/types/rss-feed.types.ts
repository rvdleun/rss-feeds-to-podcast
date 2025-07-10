export interface RssFeedItem {
  content: string;
  id: string;
  src: string;
  title: string;
}

export interface RssFeedData {
  items: RssFeedItem[];
  title: string;
}
