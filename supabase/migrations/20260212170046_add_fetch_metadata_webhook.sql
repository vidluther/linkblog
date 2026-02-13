-- Enable pg_net for HTTP requests from triggers
create extension if not exists pg_net with schema extensions;

-- Config table for trigger settings (avoids ALTER DATABASE permission issues)
create table if not exists public.app_config (
  key text primary key,
  value text not null
);

-- Seed after setup (local):
--   INSERT INTO app_config (key, value) VALUES
--     ('supabase_url', 'http://127.0.0.1:54321')
--   ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
--
-- Seed after setup (production):
--   INSERT INTO app_config (key, value) VALUES
--     ('supabase_url', 'https://<ref>.supabase.co')
--   ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Function that calls the fetch-metadata edge function via pg_net
create or replace function public.notify_fetch_metadata()
returns trigger
language plpgsql
security definer
as $$
declare
  edge_function_url text;
  base_url text;
  request_id bigint;
begin
  select value into base_url from public.app_config where key = 'supabase_url';

  if base_url is null or base_url = '' then
    raise warning 'fetch-metadata trigger: app_config missing supabase_url';
    return NEW;
  end if;

  edge_function_url := base_url || '/functions/v1/fetch-metadata?link_id=' || NEW.id::text;

  -- Fire-and-forget HTTP POST via pg_net
  select net.http_post(
    url := edge_function_url,
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := '{}'::jsonb
  ) into request_id;

  return NEW;
end;
$$;

-- Trigger: fire after insert on links when title is missing
create trigger on_link_insert_fetch_metadata
  after insert on public.links
  for each row
  when (NEW.title is null or NEW.title = '')
  execute function public.notify_fetch_metadata();
