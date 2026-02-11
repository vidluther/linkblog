---
layout: default
title: Getting Started
---

# Getting Started

## Prerequisites

- **Node.js** 20+ and **pnpm**
- A [Supabase](https://supabase.com/) project (free tier works)
- The [Supabase CLI](https://supabase.com/docs/guides/cli) (for migrations and local dev)

## Clone and Install

```bash
git clone https://github.com/vidluther/linkblog.git
cd linkblog
pnpm install
```

## Environment Variables

Create a `.env` file in the project root:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
API_KEY=a-secret-key-for-write-endpoints
PORT=3000
```

| Variable           | Description                                   |
| ------------------ | --------------------------------------------- |
| `SUPABASE_URL`     | Your Supabase project URL                     |
| `SUPABASE_ANON_KEY`| Supabase anonymous/public key                 |
| `API_KEY`          | Protects write endpoints via `x-api-key` header |
| `PORT`             | Server port (defaults to `3000`)              |

## Database Setup

The Supabase migration creates the `links` table automatically.

```bash
# Link to your Supabase project
npx supabase link --project-ref your-project-ref

# Run migrations
npx supabase db push
```

To seed the database with sample data:

```bash
npx supabase db reset
```

This runs `supabase/seed.sql` which inserts a handful of example links.

## Run Locally

```bash
# Development (with hot reload)
pnpm start:dev

# Production build
pnpm build
pnpm start:prod
```

The API will be available at `http://localhost:3000`.

## Run Tests

```bash
# Unit tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:cov

# End-to-end tests
pnpm test:e2e
```

## Lint and Format

```bash
# Lint
pnpm lint

# Lint with auto-fix
pnpm lint:fix

# Format check
pnpm fmt:check

# Format
pnpm fmt
```

## Verify It Works

Once the server is running:

```bash
# Health check
curl http://localhost:3000/health

# List links (requires API key)
curl -H "x-api-key: your-api-key" http://localhost:3000/links

# RSS feed (public)
curl http://localhost:3000/feed
```

### Using Postman

A Postman collection and environment are included in `postman/`:

1. Import `postman/collection.json` and `postman/environment.json` into Postman
2. Select the **Linkblog - Local** environment
3. Set the `apiKey` variable to your `API_KEY` value
4. Run individual requests or use the **Collection Runner** on the "CRUD Workflow" folder for a full end-to-end lifecycle test

The collection auto-captures `linkId` from responses, so create/list → get → update → delete flows work without manual copy-paste.

---

Next: [API Reference](api)
