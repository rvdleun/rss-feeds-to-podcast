import { Segment } from '../../types/segment';

export const evaluateArticlePrompt = ({ content }: Segment) => `
Analyze the following article and determine if it would make good podcast content.

## Evaluation Criteria:
A good podcast article should have:
- **Discussion potential**: Contains topics that invite opinions, debate, or analysis
- **Human interest**: Affects people's lives, emotions, or decisions
- **Narrative elements**: Has stories, characters, conflicts, or developments
- **Broader relevance**: Connects to larger trends, issues, or cultural moments
- **Audience engagement**: Would listeners care about or relate to this topic?

## Poor podcast content includes:
- Step-by-step tutorials or how-to guides
- Dense technical specifications or API documentation
- Pure code examples or configuration files
- Academic papers without broader implications
- Content that's better consumed visually (charts, diagrams)

## Note: Product announcements, even technical ones, can be good podcast content if they have broader implications, competitive angles, or societal impact.

## Article to evaluate:
${content}

Return only "TRUE" or "FALSE". Do not include any other text, explanations, or formatting.
`;
