# fetch-metadata Edge Function

Supabase Deno Edge Function that auto-fetches OpenGraph metadata (title, description) for links missing titles. Named after **Dogmatix** (the dog from Asterix and Obelix) — it's the user-agent that sniffs out metadata.

## How It Works

1. Queries `links` where `title` is NULL or empty
2. Fetches each URL, parses HTML for OG tags
3. Updates the row with extracted metadata
4. Returns a JSON report of what was processed

### Metadata Extraction Priority

| Field       | 1st choice       | 2nd choice                 | Fallback     |
| ----------- | ---------------- | -------------------------- | ------------ |
| **Title**   | `og:title`       | `<title>` tag              | URL hostname |
| **Summary** | `og:description` | `meta[name="description"]` | leave NULL   |

### Safety

- SSRF protection: blocks localhost, private IPs, non-HTTP protocols
- Content-type validation: only processes `text/html` / `application/xhtml`
- Response size limit: 5 MB
- Fetch timeout: 10 seconds
- Title truncated to 500 chars, description to 1000 chars

## Database Trigger

An `AFTER INSERT` trigger on `links` automatically calls this function (via `pg_net`) when a link is inserted without a title. The trigger reads the Supabase base URL from the `app_config` table.

## Local Development

### Prerequisites

- Supabase CLI (`pnpx supabase`)
- Local Supabase running (`pnpx supabase start`)

### Setup

1. Create `supabase/.env.local` with the secret key from `pnpx supabase status`:

```
SB_PUBLISHABLE_KEY=<Secret key from supabase status>
```

2. Reset the database (applies migration + seed):

```bash
pnpx supabase db reset
```

The seed file (`supabase/seed.sql`) inserts the `app_config` row with `supabase_url = http://kong:8000` (the Docker-internal gateway address).

3. Serve the function:

```bash
pnpx supabase functions serve fetch-metadata --env-file supabase/.env.local
```

### Test manually

```bash
# Batch: process up to 5 links with missing titles
curl 'http://127.0.0.1:54321/functions/v1/fetch-metadata?limit=5'

# Single link by ID
curl 'http://127.0.0.1:54321/functions/v1/fetch-metadata?link_id=42'
```

### Debugging the trigger

```sql
-- Check if pg_net made any requests
SELECT id, status_code, content, created
FROM net._http_response ORDER BY created DESC LIMIT 10;

-- Check trigger exists and is enabled (tgenabled = 'O' means enabled)
SELECT tgname, tgenabled FROM pg_trigger WHERE tgname = 'on_link_insert_fetch_metadata';

-- Check the app_config value
SELECT * FROM app_config;
```

## Deploy to Production

All commands use `--linked` to target the linked Supabase project:

```bash
# 1. Deploy the edge function
pnpx supabase functions deploy fetch-metadata --linked

# 2. Push database migrations (creates trigger + app_config table)
pnpx supabase db push --linked

# 3. Set the secret key for the function
pnpx supabase secrets set SB_PUBLISHABLE_KEY="<your sb_secret_* key>" --linked

# 4. Seed app_config with your production Supabase URL (run in SQL Editor)
INSERT INTO app_config (key, value) VALUES
  ('supabase_url', 'https://<your-project-ref>.supabase.co')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
```

### Verify production deployment

```bash
curl 'https://<your-project-ref>.supabase.co/functions/v1/fetch-metadata?limit=1'
```

## Files

| File                    | Purpose                                                        |
| ----------------------- | -------------------------------------------------------------- |
| `index.ts`              | Main Deno handler — query params, DB queries, batch processing |
| `metadata-extractor.ts` | URL fetching, HTML parsing, OG tag extraction                  |
| `deno.json`             | Import map (linkedom, @supabase/supabase-js)                   |

## Configuration

- `supabase/config.toml` — `[functions.fetch-metadata]` sets `verify_jwt = false`
- `supabase/.env.local` — `SB_PUBLISHABLE_KEY` for local dev (gitignored)
- `supabase/seed.sql` — Seeds `app_config` with `supabase_url` for the trigger
- `supabase/migrations/20260212170046_add_fetch_metadata_webhook.sql` — Trigger + `app_config` table
