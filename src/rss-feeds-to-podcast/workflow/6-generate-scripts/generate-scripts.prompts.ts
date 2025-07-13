import { Segment } from '../../types/segment';
import { PodcastConfig } from '../../modules/config/schemas/podcast.schema';

export const generateIntroScriptPrompt = (
  briefs: string[],
  { behaviour, hosts, name }: PodcastConfig,
) => `
You are generating a podcast conversation segment between two hosts discussing a single article. Create natural, engaging dialogue that flows conversationally.

# Hosts
${hosts.map((host) => `- ${host.id}: ${host.description}`).join('\n')}

${behaviour}

# Today's Topics
${briefs.map((brief) => `- ${brief}\n`)}

# Introduction Requirements

## Core Elements (Must Include)
- Welcome the audience to "${name}"
- Briefly preview today's topics without revealing order
- Create anticipation for the upcoming discussions
- Keep tone friendly, informal, and engaging

## Content Boundaries (Do NOT Include)
- Detailed discussion of any specific articles
- Guest introductions
- Future episode mentions
- Transitions to main content ("let's start with...")
- Calls to action or audience instructions

## Structure & Length
- **4-6 total exchanges** (2-3 turns per host)
- **1-3 sentences per exchange**
- Either host can open the show
- End naturally without transitioning to main content

## Tone Examples
Use natural podcast opening language like:
- "Welcome back to ${name}!"
- "Great to be here with some interesting stories today"
- "Looking forward to diving into these topics"

# Required Output Format

Return ONLY valid JSON:

[
  { "host": "styles", "content": "..." },
  { "host": "phoebe", "content": "..." }
]

Generate a natural, welcoming introduction now.`;

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

export const generateOutroScriptPrompt = (
  briefs: string[],
  { behaviour, hosts, name }: PodcastConfig,
) => `
You are generating the closing outro for "${name}" podcast episode.

# Hosts
${hosts.map((host) => `- ${host.id}: ${host.description}`).join('\n')}

${behaviour}

# Today's Topics
${briefs.map((brief) => `- ${brief}\n`)}

# Outro Requirements

## Core Elements (Must Include)
- Acknowledge the topics that were discussed in this episode
- Thank the audience for listening
- Mention the podcast name "From the Cluster"
- Provide a natural conclusion to the episode
- Keep tone friendly, warm, and appreciative

## Content Boundaries (Do NOT Include)
- Detailed recap of specific article points
- Preview of future episodes or topics
- Specific calls to action (subscribe, follow, etc.)
- Guest thank-yous or mentions
- Technical show information (where to find the podcast, etc.)

## Structure & Length
- **2-4 total exchanges** (1-2 turns per host)
- **1-3 sentences per exchange**
- Either host can initiate the outro
- End with a natural farewell

## Tone Examples
Use natural podcast closing language like:
- "Thanks for joining us on From the Cluster today"
- "Great discussing these stories with you"
- "Hope you enjoyed today's episode"
- "Until next time, take care"

# Required Output Format

Return ONLY valid JSON:

[
  { "host": "styles", "content": "..." },
  { "host": "phoebe", "content": "..." }
]

Generate a natural, appreciative outro now.`;
