# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Building and Running
- `npm run build` - Build the project using NestJS CLI
- `npm run dev` - Build and run the application
- `node dist/main.js` - Run the built application directly

### Testing and Quality
- `npm test` - Run Jest tests
- `npm run test:watch` - Run Jest tests in watch mode
- `npm run lint` - Run ESLint with auto-fix

### Project Management
- `npm run backlog` - Open the backlog browser for task management

## Architecture Overview

This is a **NestJS CLI application** that converts RSS feeds to podcast episodes. The project uses:

- **NestJS Framework** with `nest-commander` for CLI functionality
- **TypeScript** with ES2021 target
- **Jest** for testing
- **ESLint** with Prettier for code quality
- **Backlog management system** for task tracking

### Key Structure
- `src/rss-feeds-to-podcast/` - Main application code
  - `main.ts` - Entry point using `CommandFactory.run()`
  - `app.module.ts` - Root NestJS module
  - `app.command.ts` - Default CLI command with basic option parsing
- `backlog/` - Task management system with markdown-based tasks
- `dist/` - Built output directory

## Testing Configuration
- Jest is configured with TypeScript support
- Test files use `*.spec.ts` naming convention
- Root directory for tests: `src/rss-feeds-to-podcast/`
- Coverage output: `coverage/` directory

## Development Notes
- Uses private logger instances with `#logger` syntax
- Follows NestJS decorator patterns (@Command, @Option, @Module)
- ESLint configuration includes Prettier integration
- Node.js >=20.0.0 and npm >=10.0.0 required