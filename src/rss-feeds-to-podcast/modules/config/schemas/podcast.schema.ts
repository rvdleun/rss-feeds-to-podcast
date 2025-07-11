import { z } from 'zod';

export const PodcastHostSchema = z.object({
  id: z.string(),
  description: z.string(),
});

export const PodcastSchema = z.object({
  behaviour: z.string(),
  hosts: z.array(PodcastHostSchema),
  numberOfSegments: z.number(),
});

export type PodcastHostConfig = z.infer<typeof PodcastHostSchema>;
export type PodcastConfig = z.infer<typeof PodcastSchema>;
