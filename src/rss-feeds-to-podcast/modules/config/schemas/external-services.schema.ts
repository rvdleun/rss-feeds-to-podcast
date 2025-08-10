import { z } from 'zod';

export const ExternalServicesSchema = z.object({
  llm: z.any(),
  textToSpeech: z.object({
    href: z.string(),
  }),
  webScraper: z.object({
    cache: z.boolean(),
    href: z.string(),
    incognito: z.boolean(),
    timeout: z.number(),
    waitUntil: z.enum(['load', 'domcontentloaded', 'networkidle', 'commit']),
  }),
});

export type ExternalServicesConfig = z.infer<typeof ExternalServicesSchema>;
