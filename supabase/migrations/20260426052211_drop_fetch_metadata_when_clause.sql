-- Fire the metadata fetcher on every link insert.
-- Previously gated on (NEW.title IS NULL OR NEW.title = ''); the edge
-- function now owns the decision of whether/what to update.

drop trigger if exists on_link_insert_fetch_metadata on public.links;

create trigger on_link_insert_fetch_metadata
  after insert on public.links
  for each row
  execute function public.notify_fetch_metadata();
