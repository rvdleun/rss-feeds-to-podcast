import { z } from 'zod';

export const ExternalServicesSchema = z.object({
  scrapper: z.object({
    cache: z.boolean(),
    href: z.string(),
    incognito: z.boolean(),
    timeout: z.number(),
    waitUntil: z.enum(['load', 'domcontentloaded', 'networkidle', 'commit']),
  }),
});

export type ExternalServicesConfig = z.infer<typeof ExternalServicesSchema>;
