import { Segment } from '../../types/segment';
import {
  PodcastConfig,
  PodcastHostConfig,
} from '../../modules/config/schemas/podcast.schema';

export const generateSegmentScriptPrompt = (
  segment: Segment,
  { behaviour, hosts }: PodcastConfig,
) => {
  const startingHost = hosts[Math.floor(Math.random() * hosts.length)];
  const otherHost = hosts.find((h) => h.id !== startingHost.id);

  return `
You are generating a podcast conversation segment between two hosts discussing a single article. Create natural, engaging dialogue that flows conversationally.

# Hosts
${hosts.map((host) => `- ${host.id}: ${host.description}`).join('\n')}

${behaviour}

# Article Details

**Title:** ${segment.item.title}
**Source:** ${segment.siteName ?? segment.origin}
**Brief:** ${segment.brief}

**Content Summary:**
${segment.summary}

# Conversation Guidelines

## Structure
- Generate 4-6 exchanges per host (8-12 total exchanges)
- Each dialogue should be 4-6 sentences long
- Begin with ${startingHost.id} introducing the article using the source and brief provided above
- End naturally when the topic feels thoroughly discussed - no episode wrap-up or goodbyes

## Conversation Flow
- Build meaningfully on the previous speaker's points
- Avoid restating or rephrasing - always advance the discussion
- Include natural synthesis of key points for audience clarity
- Maintain conversational authenticity throughout

## Content Requirements
- Focus solely on the article content - no podcast introductions or meta-commentary
- This is a segment within a larger episode, not a complete show
- No endings, farewells, calls-to-action, or "thanks for listening" language
- No transitions to other topics or future episodes

## Character Restrictions
- Use only: letters, spaces, and basic punctuation (. , ! ? ' ")
- Avoid all symbols: & @ # % $ / \\ + = * etc.
- No HTML entities (like &amp;)
- Keep dialogue natural despite these constraints

# Required Output Format

Return ONLY valid JSON in this exact structure:

[
  { "host": "${startingHost.id}", "content": "..." },
  { "host": "${otherHost.id}", "content": "..." },
  { "host": "${startingHost.id}", "content": "..." }
]

Generate the complete conversation now.`;
};
