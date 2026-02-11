# CLAUDE.md

Always use Context7 MCP when I need library/API documentation, code generation, setup or configuration steps without me having to explicitly ask.

# Project

Linkblog Service - a personal bookmarking API (NestJS + TypeScript + Supabase) that publishes an RSS feed for luther.io/blogroll.

See `docs/implementation-plan.md` for the full implementation plan and architecture.

## Key Conventions

- **Endpoints:** `/links` (CRUD; reads public, writes protected), `/feed` (public RSS 2.0), `/health` (public)
- **Auth:** Single-user, global `ApiKeyGuard` via `APP_GUARD`. Write endpoints require `x-api-key` header matching `API_KEY` env var. Public routes use `@Public()` decorator to opt out. See `src/auth/`.
- **Data model:** `links` table in Supabase (id, url, title, summary, created_at, updated_at)
- **Deploy:** AWS App Runner (manual console config; `apprunner.yaml` is reference only). Production URL: `api.linkblog.in`

## Commands

- `pnpm start:dev` — dev server with hot reload
- `pnpm build` — production build
- `pnpm test` — run all tests. `pnpm test <pattern>` to filter (e.g. `pnpm test auth`).
- `pnpm lint` / `pnpm lint:fix` — oxlint
- `pnpm fmt` / `pnpm fmt:check` — oxfmt

## Environment Variables

- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `API_KEY` - Protects write endpoints via `x-api-key` header
- `PORT` - Server port (set by App Runner in production)

## Supabase JS Client (`@supabase/supabase-js`)

- v2.x via `@supabase/supabase-js`. Use Context7 for query API reference.
- **Type generation:** `pnpx supabase gen types typescript --project-id <ref> > database.types.ts`
- **Init:** disable `autoRefreshToken` and `persistSession` (server-side, no browser sessions). See `src/supabase/supabase.module.ts`.
- **Error handling:** All queries return `{ data, error }` — always check `error` before using `data`.

## Module Structure

```
AppModule
├── ConfigModule       (global, loads .env)
├── SupabaseModule     (global, provides SUPABASE_CLIENT token)
├── AuthModule         (global ApiKeyGuard via APP_GUARD)
├── LinksModule        (CRUD service + controller)
├── FeedModule         (RSS feed generation)
└── HealthModule       (GET /health for App Runner)
```

## GitHub Pages

- `github_pages/` — Jekyll site using Minimal Mistakes (air skin), deployed via GitHub Actions to `docs.linkblog.in`

## Workflow

- All code changes must reference a GitHub issue. Check `gh issue list` before starting work.
- Use `oxlint` for linting and formatting.
- CI runs on PRs to `main` (`.github/workflows/ci.yml`): install, lint, fmt:check, build, test.

## Testing (Jest)

- Mock Supabase with a chainable object (`from/select/insert/update/delete/eq/order/single` all return `this`).
- Use `Reflect.getMetadata(KEY, handler)` to verify decorator presence on controller methods.

## Testing (Postman)

- `postman/collection.json` — API collection (folders: Health, Links, Feed, CRUD Workflow)
- `postman/environment.json` — "Linkblog - Local" env (vars: `baseUrl`, `apiKey`, `linkId`)
- `postman/specs/` — reserved for API specs
- Auth edge case tests (no key, wrong key) live in the Health folder, not a separate folder
- Links and CRUD Workflow folders use folder-level `x-api-key` auth via `{{apiKey}}`
- Test scripts auto-capture `linkId` from create/list responses for downstream requests

## Gotchas

- App Runner "config from repository" mode hides the env var UI in console. Use manual config to set secrets.
- Use `pnpx` (not `npx`) for one-off package execution — matches `pnpm` package manager.
- `but commit` uses `-p <cli-id>` (or `--changes`) to commit specific files, not `--files` or `-F`.
- GitHub repo: `vidluther/linkblog` - use with `gh` commands.

# Skills

Use the github-issues-first skill before implementing any code changes.
