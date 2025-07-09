import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { load } from 'js-yaml';
import { z } from 'zod';
import { RssConfigSchema } from './schemas';
import { Logger } from '@nestjs/common';

const logger = new Logger('ConfigLoader');

const expectedConfigPath = join(process.cwd(), '.config');
const exampleConfigPath = join(process.cwd(), '.config.example');

let configPath: string;

if (existsSync(expectedConfigPath)) {
  configPath = expectedConfigPath;
} else if (existsSync(exampleConfigPath)) {
  logger.warn(`.config directory not found. Using .config.example instead.`);
  configPath = exampleConfigPath;
}

/**
 * Generic configuration loader that loads and validates YAML configuration files
 * @param configFileName - The name of the configuration file (without extension)
 * @param schema - Zod schema for validation
 * @returns Validated configuration object
 */
export function loadYamlConfigFile<T>(
  configFileName: string,
  schema: z.ZodSchema<T>,
): T {
  logger.debug(`Loading configuration ${configFileName}.`);

  const configFile = join(configPath, `${configFileName}.yaml`);

  if (!existsSync(configFile)) {
    throw new Error(
      `No configuration file found for ${configFileName}. Please create .config/${configFileName}.yaml or ensure .config.example/${configFileName}.yaml exists.`,
    );
  }

  try {
    const fileContents = readFileSync(configFile, 'utf8');
    const rawConfig = load(fileContents);
    return schema.parse(rawConfig);
  } catch (error) {
    if (error.name === 'ZodError') {
      const zodError = error as any;
      const errorMessages = zodError.errors
        .map((err: any) => `${err.path.join('.')}: ${err.message}`)
        .join(', ');
      throw new Error(
        `Configuration validation failed for ${configFileName}: ${errorMessages}`,
      );
    }
    throw new Error(
      `Failed to load configuration from ${configFile}: ${error.message}`,
    );
  }
}

/**
 * Loads all application configurations
 * @returns Object containing all configuration sections
 */
export const loadConfig = () => {
  const rss = loadYamlConfigFile('rss', RssConfigSchema);

  return {
    rss,
  };
};
