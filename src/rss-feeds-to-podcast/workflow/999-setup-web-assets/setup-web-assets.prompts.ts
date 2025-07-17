import { Segment } from '../../types/segment';
import { PodcastConfig } from '../../modules/config/schemas/podcast.schema';

export const generateDescriptionPrompt = (
  { hosts, name }: PodcastConfig,
  segments: Segment[],
) => `You are an editor for the podcast *${name}*.

The hosts are:
${hosts.map(({ id, description }) => `- ${id}: ${description}`).join('\n')}

Your task is to write a concise, engaging summary of today's episode (max 100 words). Write in a friendly and informative tone suitable for podcast listeners.

The hosts discussed the following topics:
${segments.map(({ brief }) => `- ${brief}`).join('\n')}`;
