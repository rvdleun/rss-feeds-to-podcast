import { z } from 'zod';

export const RssFeedSchema = z.object({
  disabled: z.boolean().optional(),
  src: z.string().url('RSS feed src must be a valid URL'),
  title: z.string().optional(),
});

export const RssConfigSchema = z.object({
  feeds: z.array(RssFeedSchema).min(1, 'At least one RSS feed is required'),
  maxAgeHours: z.number().positive().optional(),
});

export type RssConfig = z.infer<typeof RssConfigSchema>;
export type RssFeed = z.infer<typeof RssFeedSchema>;
