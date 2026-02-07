# CLAUDE.md

# Project

Linkblog Service - a personal bookmarking API (NestJS + TypeScript + Supabase) that publishes an RSS feed for luther.io/blogroll.

See `docs/implementation-plan.md` for the full implementation plan and architecture.

## Key Conventions

- **Endpoints:** `/links` (CRUD, API key protected), `/feed` (public RSS 2.0), `/health` (public)
- **Auth:** Single-user, no auth system. Write endpoints use `x-api-key` header checked against `API_KEY` env var.
- **Data model:** `links` table in Supabase (id, url, title, summary, created_at, updated_at)
- **Deploy:** AWS App Runner via Docker

## Environment Variables

- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `API_KEY` - Protects write endpoints via `x-api-key` header
- `PORT` - Server port (set by App Runner in production)

## Workflow

- All code changes must reference a GitHub issue. Check `gh issue list` before starting work.
- Use `oxlint` for linting and formatting.

## Gotchas

- `but commit` uses `-p <cli-id>` (or `--changes`) to commit specific files, not `--files` or `-F`.
- GitHub repo: `vidluther/linkblog` - use with `gh` commands.

# Skills

Use the gitbutler skill to handle version control.
Use the github-issues-first skill before implementing any code changes.
