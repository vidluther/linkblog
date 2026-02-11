---
layout: default
title: Implementation Plan
---

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

| Column     | Type        | Constraints   |
| ---------- | ----------- | ------------- |
| id         | integer     | PK            |
| url        | text        |               |
| title      | text        |               |
| summary    | text        |               |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

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

## GitHub Issues

| Issue | Title                                              | Depends On | Status |
| ----- | -------------------------------------------------- | ---------- | ------ |
| #1    | Initialize Repository with Development Tooling     | —          | Closed |
| #2    | Create implementation plan                          | —          | Closed |
| #3    | Provision Supabase project & create `links` table   | —          | Closed |
| #4    | Set up NestJS project skeleton                      | #1         | Closed |
| #5    | Create Supabase client provider                     | #4         | Closed |
| #6    | Implement links service (CRUD via Supabase)         | #5         | Open   |
| #7    | Implement links controller & API-key guard          | #6         | Open   |
| #8    | Implement RSS Feed endpoint (`/feed`)               | #6         | Closed |

## Implementation Phases

### Phase 1: Foundation (Issues #1–#4) ✅

**Goal:** Project scaffolded, database ready.

- [x] Initialize repo with development tooling (Issue #1)
- [x] Create implementation plan (Issue #2)
- [x] Provision Supabase project & create `links` table with migration and seed data (Issue #3)
- [x] Set up NestJS project skeleton with TypeScript strict mode, oxlint, links module scaffold (Issue #4)

### Phase 2: Supabase Client (Issue #5) ✅

**Goal:** NestJS can talk to Supabase.

- [x] Install `@nestjs/config` and configure `ConfigModule.forRoot({ isGlobal: true })`
- [x] Create `SupabaseModule` (`@Global()`) that provides a configured `@supabase/supabase-js` client
- [x] Client options disable `autoRefreshToken` and `persistSession` (server-side best practice)
- [x] Import `SupabaseModule` in `AppModule`
- [x] Verify connection works with a simple query

### Phase 3: Core API (Issues #6, #7)

**Goal:** Full CRUD for links, protected by API key.

#### Links Service (Issue #6)

- [x] `findAll()` — returns links ordered by `created_at` descending
- [ ] `findOne(id)` — returns a single link or throws `NotFoundException`
- [ ] `create(dto)` — inserts a link and returns it
- [ ] `update(id, dto)` — updates and returns, throws if missing
- [ ] `remove(id)` — deletes, throws if missing
- [ ] All methods check `{ data, error }` and throw on error
- [ ] Unit tests with mocked Supabase client

#### Controller & API Key Guard (Issue #7)

- [ ] `ApiKeyGuard` reads `x-api-key` header, compares to `API_KEY` env var, returns 401 on mismatch
- [ ] `GET /links` and `GET /links/:id` — public
- [ ] `POST /links`, `PATCH /links/:id`, `DELETE /links/:id` — protected
- [ ] DTOs use `class-validator` decorators
- [ ] E2e tests (with and without valid API key)

### Phase 4: RSS Feed (Issue #8) ✅

**Goal:** Public RSS feed for luther.io consumption.

- [x] Create `FeedModule` + `FeedController`
- [x] `GET /feed` returns RSS 2.0 XML (`Content-Type: application/rss+xml`)
- [x] Uses `feed` npm package to build RSS document
- [x] Each link → `<item>` with `<title>`, `<link>`, `<description>`, `<pubDate>`, `<guid>`
- [x] `FeedService` reuses `LinksService.findAll()` — no duplicated Supabase queries
- [ ] Unit/e2e test verifies valid XML output

### Phase 5: Deployment (no issue yet)

**Goal:** Dockerized and deployable to AWS App Runner.

- [ ] Multi-stage Dockerfile (build + production with slim Node base)
- [ ] `.dockerignore` (node_modules, .git, .env, etc.)
- [ ] `GET /health` endpoint for App Runner health checks
- [ ] PORT read from environment (App Runner sets this)

## Dependency Graph

```
Phase 1:  #1 (tooling) ──> #4 (skeleton) ──> #5 (supabase client)
          #2 (plan)                                │
          #3 (schema)                              v
                                              #6 (service) ──┬──> #7 (controller + guard)
                                                             └──> #8 (RSS feed)
```
