---
layout: single
title: Architecture
toc: true
---

# Architecture

## Overview

Linkblog is a single-purpose API service. There is no frontend — it is designed to be called by scripts, shortcuts, or other services. The public RSS feed is consumed by [luther.io](https://luther.io) at build time.

```
                           ┌─────────────────────────┐
                           │      Supabase (DB)       │
                           │  ┌───────────────────┐   │
                           │  │   links table      │   │
                           │  │   (Postgres)       │   │
                           │  └───────────────────┘   │
                           └────────────▲─────────────┘
                                        │
                                        │  @supabase/supabase-js
                                        │
┌──────────────┐           ┌────────────┴─────────────┐
│  curl / apps │──────────▶│      NestJS API          │
└──────────────┘   HTTP    │                          │
                           │  POST/GET/PATCH/DELETE    │
                           │  /links    (API key)     │
                           │                          │
                           │  GET /feed  (public RSS) │
                           │  GET /health (public)    │
                           └──────────────────────────┘
                                        │
                                        │  Docker
                                        ▼
                           ┌──────────────────────────┐
                           │    AWS App Runner         │
                           └──────────────────────────┘
```

## NestJS Module Structure

```
AppModule
├── ConfigModule          (global, loads .env)
├── SupabaseModule        (global, provides Supabase client)
├── LinksModule           (CRUD service + controller)
└── FeedModule            (RSS feed generation) [planned]
```

### AppModule

The root module. Imports `ConfigModule.forRoot({ isGlobal: true })` so environment variables are available everywhere, plus `SupabaseModule` and `LinksModule`.

### SupabaseModule

A `@Global()` module that creates and exports a configured `SupabaseClient`. It uses `ConfigService` to read `SUPABASE_URL` and `SUPABASE_ANON_KEY`, and disables `autoRefreshToken` and `persistSession` since this is a server-side app with no browser sessions.

The client is provided under the `SUPABASE_CLIENT` injection token.

### LinksModule

Contains the `LinksService` (business logic and Supabase queries) and `LinksController` (HTTP endpoints). The service injects the `SUPABASE_CLIENT` token and performs all database operations.

### FeedModule (planned)

Will contain a `FeedController` that reads links from the database and returns an RSS 2.0 XML document using the `feed` npm package.

## Key Design Decisions

### Single-user, API-key auth

There is no user system. A single `API_KEY` environment variable protects write operations. This keeps the codebase minimal — the only consumer is the project owner.

### Supabase as the data layer

Instead of running a Postgres instance, the service uses Supabase's hosted Postgres via the `@supabase/supabase-js` client. This provides:

- Managed database with automatic backups
- REST-like query API from the JS client
- Migrations managed via the Supabase CLI
- Free tier sufficient for a personal project

### RSS as the output format

The primary consumer of link data is [luther.io](https://luther.io), which fetches the RSS feed at build time. RSS 2.0 was chosen because it is universally supported and simple to generate.

### No frontend

The API is meant to be called from scripts, iOS shortcuts, or CLI tools. A frontend would add unnecessary complexity for a single-user tool.

## Request Flow

1. Client sends HTTP request to NestJS
2. For protected endpoints, the `ApiKeyGuard` checks the `x-api-key` header
3. Controller delegates to `LinksService`
4. `LinksService` calls Supabase via `@supabase/supabase-js`
5. Supabase returns `{ data, error }`
6. Service checks for errors, throws NestJS exceptions if needed
7. Controller returns the response to the client

## Directory Structure

```
linkblog/
├── docs/                  # GitHub Pages documentation
├── postman/
│   ├── collection.json    # Postman collection (all endpoints + tests)
│   ├── environment.json   # "Linkblog - Local" environment
│   └── specs/             # API specs (planned)
├── src/
│   ├── main.ts            # Bootstrap and start server
│   ├── app.module.ts      # Root module
│   ├── app.controller.ts  # Health check / root endpoint
│   ├── app.service.ts     # App-level service
│   ├── supabase/
│   │   └── supabase.module.ts   # Supabase client provider
│   └── links/
│       ├── links.module.ts      # Links feature module
│       ├── links.service.ts     # CRUD business logic
│       ├── links.controller.ts  # HTTP endpoints
│       ├── dto/
│       │   ├── create-link.dto.ts
│       │   └── update-link.dto.ts
│       └── entities/
│           └── link.entity.ts
├── supabase/
│   ├── config.toml        # Supabase CLI config
│   ├── migrations/        # SQL migrations
│   └── seed.sql           # Sample data
├── test/                  # E2e tests
├── package.json
├── tsconfig.json
└── CLAUDE.md              # Project conventions
```

---

Next: [Deployment](deployment)
