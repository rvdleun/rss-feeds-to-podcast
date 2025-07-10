import { z } from 'zod';

export const ExternalServicesSchema = z.object({
  llm: z.object({
    apiKey: z.string(),
    model: z.string(),

    baseURL: z.string().optional(),
    max_tokens: z.number().optional(),
    max_thinking_tokens: z.number().optional(),
    temperature: z.number().optional(),
    think: z.boolean().optional(),
  }),
  scrapper: z.object({
    cache: z.boolean(),
    href: z.string(),
    incognito: z.boolean(),
    timeout: z.number(),
    waitUntil: z.enum(['load', 'domcontentloaded', 'networkidle', 'commit']),
  }),
});

export type ExternalServicesConfig = z.infer<typeof ExternalServicesSchema>;
