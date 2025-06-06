# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack TypeScript application with React frontend and Express backend, featuring AI integration, real-time features, and a tournament/entrance system theme.

## Development Commands

### Core Development
```bash
# Start development environment (runs both frontend and backend)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run check

# Database migrations
npm run db:push
```

### Testing
```bash
# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests in watch mode
npm run test:watch
```

### Task Management
```bash
# List all tasks
npm run list

# Generate task files
npm run generate

# Parse PRD to generate tasks
npm run parse-prd <file>
```

## Architecture

### Tech Stack
- **Frontend**: React 18 with TypeScript, Vite, Tailwind CSS, shadcn/ui components
- **Backend**: Express.js with ES modules, TypeScript
- **Database**: PostgreSQL with Drizzle ORM and Supabase integration
- **AI Services**: Anthropic SDK, OpenAI SDK, Perplexity API
- **Real-time**: WebSockets (ws)
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter (lightweight React router)
- **Animation**: Framer Motion

### Project Structure
- `/client` - React frontend application
  - `/src/components` - Reusable components including shadcn/ui
  - `/src/pages` - Page components
  - `/src/lib` - Utilities and services (AI service, query client)
  - `/src/hooks` - Custom React hooks
- `/server` - Express backend
  - `index.ts` - Main server entry point
  - `routes.ts` - API route definitions
  - `ai.ts` - AI service integrations
  - `interview.ts` - Interview-related logic
  - `supabase.ts` - Supabase client configuration
- `/shared` - Shared types and schemas between frontend and backend
- `/test` - Test files and utilities

### Key Configuration Files
- `vite.config.ts` - Frontend build configuration with React plugin
- `tsconfig.json` - TypeScript config with path aliases (`@/` for client/src, `@shared/` for shared)
- `drizzle.config.ts` - Database ORM configuration
- `vitest.config.ts` - Test runner configuration with jsdom environment

## API Keys and Environment

Required environment variables (see `.env.example`):
- `ANTHROPIC_API_KEY` - Required for Claude AI integration
- `PERPLEXITY_API_KEY` - Optional for Perplexity AI
- `OPENAI_API_KEY` - Optional for OpenAI/OpenRouter
- Additional AI provider keys supported (Google, Mistral, xAI, Azure, Ollama)

## Database

Uses PostgreSQL with Drizzle ORM. The database schema is managed through Drizzle migrations. Run `npm run db:push` to apply schema changes.

## Testing Strategy

- **Test Framework**: Vitest with jsdom environment
- **Component Testing**: React Testing Library
- **API Testing**: Supertest for integration tests
- **Test Structure**:
  - Unit tests in `test/components/`
  - Integration tests in `test/integration/`
  - E2E tests in `test/e2e/`
  - Mock utilities in `test/helpers/`

## Special Features

### AI-Driven Development
The project includes Task Master AI integration for managing development tasks. Tasks are stored in `tasks.json` and can be managed through CLI commands.

### Real-time Features
WebSocket support is included for real-time functionality, with the ws package handling WebSocket connections.

### Component Library
Uses shadcn/ui components with extensive pre-built UI components in `/client/src/components/ui/`. These are customizable and follow the project's theme configuration.

## Development Notes

- The project uses ES modules (`"type": "module"` in package.json)
- Path aliases are configured for cleaner imports
- The frontend dev server is integrated with the backend through Vite middleware
- Production builds use esbuild for the backend and Vite for the frontend
- Docker support is available with a multi-stage Dockerfile