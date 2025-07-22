# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Building and Running
- `npm run build` - Build the project using NestJS CLI
- `npm run start` - Build and run the application (equivalent to `npm run build && node dist/main.js`)
- `node dist/main.js` - Run the built application directly
- `npm run start -- -Y` - Run with confirmation skip flag

### Testing and Quality
- `npm test` - Run Jest tests
- `npm run test:watch` - Run Jest tests in watch mode
- `npm run lint` - Run ESLint with auto-fix

### Project Management
- `npm run backlog` - Open the backlog browser for task management

## Architecture Overview

This is a **NestJS CLI application** that converts RSS feeds to podcast episodes using a multi-stage pipeline. The project uses:

- **NestJS Framework** with `nest-commander` for CLI functionality
- **TypeScript** with ES2021 target
- **Jest** for testing
- **ESLint** with Prettier for code quality
- **Zod** for configuration schema validation
- **External services**: LLM (OpenAI-compatible), Text-to-Speech (Kokoro), Web Scraper

### Key Structure
- `src/rss-feeds-to-podcast/` - Main application code
  - `main.ts` - Entry point using `CommandFactory.run()`
  - `app.module.ts` - Root NestJS module importing all workflow and service modules
  - `app.command.ts` - Default CLI command orchestrating the 7-step workflow
  - `modules/` - Core services (config, LLM, TTS, web scraper, output)
  - `workflow/` - Seven sequential processing steps (1-rss-feed through 7-generate-audio, plus 999-setup-web-assets)
  - `types/` - TypeScript type definitions
  - `utils/` - Utility functions
- `backlog/` - Task management system with markdown-based tasks
- `.config/` - YAML configuration files (copy from `.config.example/`)
- `output/` - Generated podcast files and intermediate data
- `external-services/` - Docker compose files for external dependencies

### Workflow Pipeline
The application runs a 7-step pipeline:
1. **RSS Feed Retrieval** - Fetch and store RSS feeds
2. **Segment Selection** - Randomly select articles for episodes
3. **Content Scraping** - Extract article content using web scraper
4. **Segment Filtering** - Remove unsuitable articles using LLM analysis
5. **Summary Generation** - Create summaries and one-line briefs
6. **Script Generation** - Generate host dialogue for each segment plus intro/outro
7. **Audio Generation** - Convert scripts to audio and merge into final podcast

### Configuration System
- Uses Zod schemas for validation in `modules/config/schemas/`
- Configuration loaded from `.config/` YAML files:
  - `external-services.yaml` - Service endpoints and credentials
  - `podcast.yaml` - Podcast metadata, hosts, and behavior settings
  - `rss.yaml` - RSS feed URLs
- `AppConfigService` provides typed configuration access

### External Dependencies
- **FFmpeg** - Required for audio processing
- **LLM Service** - OpenAI-compatible API for content analysis and script generation
- **Kokoro TTS** - Text-to-speech service for voice generation
- **Web Scraper** - Content extraction service

## Testing Configuration
- Jest is configured with TypeScript support
- Test files use `*.spec.ts` naming convention
- Root directory for tests: `src/rss-feeds-to-podcast/`
- Coverage output: `coverage/` directory

## Development Notes
- Uses private logger instances with `#logger` syntax
- Follows NestJS decorator patterns (@Command, @Option, @Module, @Injectable)
- ESLint configuration includes Prettier integration
- Node.js >=20.0.0 and npm >=10.0.0 required
- All workflow services are stateless and depend on file-based output from previous steps