# CLAUDE.md

Always use Context7 MCP when I need library/API documentation, code generation, setup or configuration steps without me having to explicitly ask.

# Project

Linkblog Service - a personal bookmarking API (NestJS + TypeScript + Supabase) that publishes an RSS feed for luther.io/blogroll.

See `docs/implementation-plan.md` for the full implementation plan and architecture.

## Key Conventions

- **Endpoints:** `/links` (CRUD, API key protected), `/feed` (public RSS 2.0), `/health` (public)
- **Auth:** Single-user, global `ApiKeyGuard` via `APP_GUARD`. Write endpoints require `x-api-key` header matching `API_KEY` env var. Public routes use `@Public()` decorator to opt out. See `src/auth/`.
- **Data model:** `links` table in Supabase (id, url, title, summary, created_at, updated_at)
- **Deploy:** AWS App Runner via Docker

## Environment Variables

- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `API_KEY` - Protects write endpoints via `x-api-key` header
- `PORT` - Server port (set by App Runner in production)

## Supabase JS Client (`@supabase/supabase-js`)

- **Version:** v2.x (latest)
- **Init:** `createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, options)` — use generated types for full type safety
- **Type generation:** `npx supabase gen types typescript --project-id <ref> > database.types.ts`
- **Server-side options:** Disable auth features not needed in a backend service:
  ```ts
  createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  ```
- **Query patterns (all return `{ data, error }`):**
  - Select: `supabase.from('links').select('*').order('created_at', { ascending: false })`
  - Select one: `supabase.from('links').select('*').eq('id', id).single()`
  - Insert: `supabase.from('links').insert({ url, title, summary }).select()`
  - Update: `supabase.from('links').update({ title, updated_at: new Date().toISOString() }).eq('id', id).select()`
  - Delete: `supabase.from('links').delete().eq('id', id)`
  - Upsert: `supabase.from('links').upsert(row, { onConflict: 'id' }).select()`
  - Count: `supabase.from('links').select('*', { count: 'exact', head: false })`
- **Filters:** `.eq()`, `.neq()`, `.gt()`, `.gte()`, `.lt()`, `.lte()`, `.like()`, `.ilike()`, `.in()`
- **Pagination:** `.order(column, { ascending })`, `.limit(n)`, `.range(from, to)`
- **Error handling:** Always check `error` before using `data` — errors are returned, not thrown

## Workflow

- All code changes must reference a GitHub issue. Check `gh issue list` before starting work.
- Use `oxlint` for linting and formatting.

## Testing (Postman)

- `postman/collection.json` — API collection (folders: Health, Links, Feed, CRUD Workflow)
- `postman/environment.json` — "Linkblog - Local" env (vars: `baseUrl`, `apiKey`, `linkId`)
- `postman/specs/` — reserved for API specs
- Auth edge case tests (no key, wrong key) live in the Health folder, not a separate folder
- Links and CRUD Workflow folders use folder-level `x-api-key` auth via `{{apiKey}}`
- Test scripts auto-capture `linkId` from create/list responses for downstream requests

## Gotchas

- `but commit` uses `-p <cli-id>` (or `--changes`) to commit specific files, not `--files` or `-F`.
- GitHub repo: `vidluther/linkblog` - use with `gh` commands.

# Skills

Use the gitbutler skill to handle version control.
Use the github-issues-first skill before implementing any code changes.
