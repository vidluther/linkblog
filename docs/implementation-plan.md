# Linkblog Service - Implementation Plan

## Overview

A personal bookmarking API built with NestJS + TypeScript + Supabase. Stores articles with notes and publishes them as a public RSS feed for the blogroll at luther.io/blogroll.

## Architecture

```
Client (curl/scripts) --> NestJS API --> Supabase (Postgres)
                              |
                              +--> GET /feed (public RSS 2.0)
                              +--> CRUD /links (API key protected)
```

### Key Decisions

- **Single-user, no auth system** - write endpoints protected by API key (`x-api-key` header)
- **API-only** - no frontend, interaction via API calls
- **Minimal data model** - url, title, summary, created_at, updated_at
- **RSS 2.0 feed** - public, reverse chronological, consumed by luther.io at build time
- **Deploy** - AWS App Runner via Docker

### Data Model

**Table: `links`**

| Column     | Type        | Constraints                   |
| ---------- | ----------- | ----------------------------- |
| id         | uuid        | PK, default gen_random_uuid() |
| url        | text        | NOT NULL                      |
| title      | text        |                               |
| summary    | text        |                               |
| created_at | timestamptz | default now()                 |
| updated_at | timestamptz | default now()                 |

### Endpoints

| Method | Path       | Auth    | Description                         |
| ------ | ---------- | ------- | ----------------------------------- |
| POST   | /links     | API key | Create a link                       |
| GET    | /links     | API key | List all links (desc by created_at) |
| GET    | /links/:id | API key | Get a single link                   |
| PATCH  | /links/:id | API key | Update a link                       |
| DELETE | /links/:id | API key | Delete a link (204)                 |
| GET    | /feed      | Public  | RSS 2.0 feed                        |
| GET    | /health    | Public  | Health check for App Runner         |

## Implementation Phases

### Phase 1: Foundation (Issues #1, #2, #3)

**Goal:** Project scaffolded, database ready, Supabase connected.

#### Step 1 - Scaffold NestJS project (Issue #1)

- `npx @nestjs/cli new` with TypeScript strict mode
- Install oxlint
- Create `.env.example` with SUPABASE_URL, SUPABASE_ANON_KEY, API_KEY, PORT
- Verify app starts and responds

#### Step 2 - Define links table schema (Issue #2)

_Can be done in parallel with Step 3._

- Write SQL migration: `supabase/migrations/001_create_links_table.sql`
- Create the table in the existing Supabase instance
- Verify table exists with correct columns and defaults

#### Step 3 - Connect to Supabase (Issue #3)

_Can be done in parallel with Step 2._

- Install `@supabase/supabase-js` and `@nestjs/config`
- Create SupabaseModule + SupabaseService (injectable singleton client)
- Read SUPABASE_URL and SUPABASE_ANON_KEY from env
- Verify connection works (health check or simple query)

### Phase 2: Core API (Issues #8, #5)

**Goal:** Full CRUD for links, protected by API key.

#### Step 4 - API key guard (Issue #8)

- Create `ApiKeyGuard` that checks `x-api-key` header against `API_KEY` env var
- Returns 401 if missing or incorrect
- Applicable via `@UseGuards(ApiKeyGuard)` decorator

#### Step 5 - CRUD endpoints for /links (Issue #5)

- Create LinksModule, LinksController, LinksService
- DTOs: CreateLinkDto (url required, title optional, summary optional), UpdateLinkDto
- All routes protected by ApiKeyGuard
- GET /links returns links ordered by created_at desc
- PATCH updates updated_at
- DELETE returns 204
- Proper error responses (404, 400)

### Phase 3: RSS Feed (Issue #9)

**Goal:** Public RSS feed for luther.io consumption.

#### Step 6 - RSS feed endpoint (Issue #9)

- Create FeedModule + FeedController
- GET /feed returns RSS 2.0 XML (Content-Type: application/rss+xml)
- Each item: title, link, description (summary), pubDate
- Feed metadata: title, description, link
- No auth required
- Links ordered by created_at desc

### Phase 4: Deployment (Issue #10)

**Goal:** Dockerized and deployable to AWS App Runner.

#### Step 7 - Dockerize for App Runner (Issue #10)

- Multi-stage Dockerfile (build + production with slim Node base)
- `.dockerignore` (node_modules, .git, .env, etc.)
- Health check endpoint: GET /health
- PORT read from environment (App Runner sets this)
- Verify docker build and run works locally

## Parallel Execution Map

```
Phase 1:  #1 ──────────┬──> #2 (schema)  ──┐
                        └──> #3 (supabase) ─┤
                                            │
Phase 2:                    #8 (guard) ─────┤
                                            └──> #5 (CRUD)
                                            │
Phase 3:                    #9 (RSS feed) ──┤
                                            │
Phase 4:                    #10 (Docker) ───┘
```

Steps 2+3 can run in parallel. Steps 5+6 can run in parallel once their dependencies are met.
