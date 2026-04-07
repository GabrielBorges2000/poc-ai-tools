# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PoC for testing AI tools concepts using Ollama models. The application analyzes documents (images, PDFs, text files) using AI to validate authenticity and extract information.

## Commands

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Database commands (all require .env loaded via pnpm env:load)
pnpm run db:migrate    # Run migrations
pnpm run db:reset      # Reset database and seed
pnpm run db:generate   # Generate Prisma client
pnpm run db:push       # Push schema to database
pnpm run db:validate   # Validate schema
pnpm run db:studio     # Open Prisma Studio
pnpm run db:seed       # Run seed script

# Code quality
pnpm run format        # Format code with Biome
pnpm run lint          # Lint code with Biome
pnpm run check         # Run both format and lint
```

## Architecture

**Framework:** Fastify 5 with TypeScript and Zod type provider for request/response validation.

**Entry Point:** `src/server.ts` → imports `src/app.ts` (Fastify instance setup).

**Module System:** All routes registered via `src/modules/index.ts` which exports a `registerRoutes()` function. Currently only `document-analysis-router.ts` is registered.

**Key Patterns:**
- Fastify instance configured with `ZodTypeProvider` for type-safe routes
- Routes use `app.withTypeProvider<ZodTypeProvider>()` for schema validation
- Error handling via centralized `errorHandler` in `src/modules/_errors/error-handler.ts`
- Swagger/OpenAPI docs available at `/api-docs`

**AI Integration:**
- Uses Vercel AI SDK (`generateText`) with Ollama provider
- Model: `qwen3.5:cloud` (configured in `src/ai/document-analyzer.ts`)
- Supports image (base64), PDF text extraction, and plain text analysis
- Prompt building is dynamic based on `DocumentType` database records

**Database:**
- PostgreSQL via Prisma ORM
- Models: `DocumentType` (knowledge base for expected fields), `ProcessingLog` (audit trail)
- Schema in `prisma/schema.prisma`

**File Processing:**
- Images: processed via Sharp (resize to 768px, convert HEIC/HEIF to JPEG)
- PDFs: text extraction via pdf-parse, limited image extraction
- Max file size: 10MB

**Configuration:**
- Environment variables loaded via `dotenv-cli` (`pnpm env:load` prefix)
- Required: `DATABASE_URL`
- Optional: `PORT` (default handled by Fastify)
- Biome configured for formatting/linting (2-space indent, single quotes, 80 char lines)

**Build:**
- tsup bundles all `src/` entries
- No external bundling for internal packages (`@saas/auth`, `@saas/env` in config but not used)
- Output to `dist/`
