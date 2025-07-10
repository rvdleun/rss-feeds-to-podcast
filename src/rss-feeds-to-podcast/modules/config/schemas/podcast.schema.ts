import { z } from 'zod';

export const PodcastSchema = z.object({
  numberOfSegments: z.number(),
});

export type PodcastConfig = z.infer<typeof PodcastSchema>;
