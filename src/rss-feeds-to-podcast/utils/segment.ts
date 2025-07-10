import { Segment } from '../types/segment';

export const getSegmentOrigin = (segment: Segment) =>
  segment.siteName ?? segment.origin;

export const generateSegmentDescription = (segment: Segment) => {
  return `${segment.id} (${getSegmentOrigin(segment)} - ${segment.item.title}`;
};
