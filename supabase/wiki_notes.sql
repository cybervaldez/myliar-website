-- Community notes for the wiki ("The Codex"). Anchored notes with a
-- resolve lifecycle: anonymous insert (open only); public read of
-- non-declined notes; triage (status + reply) happens via the service
-- role, which bypasses RLS.
--
-- Apply once against the Supabase project (SQL editor, or `supabase db
-- push` / psql). Idempotent.

create table if not exists public.wiki_notes (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  anchor       text not null,                    -- e.g. 'arc:day-1', 'character:hana'
  anchor_label text,                             -- human label for the entity
  kind         text not null check (kind in ('question','disagree','suggest','praise')),
  body         text not null check (char_length(body) between 1 and 4000),
  author       text not null default 'anon',
  status       text not null default 'open' check (status in ('open','applied','declined','discuss')),
  resolution   text,                             -- the writers'-room reply
  resolved_at  timestamptz
);

create index if not exists wiki_notes_anchor_idx on public.wiki_notes (anchor);
create index if not exists wiki_notes_status_idx on public.wiki_notes (status);

alter table public.wiki_notes enable row level security;

-- Public can READ everything except declined notes (declined = spam /
-- rejected, hidden from the public threads).
drop policy if exists wiki_notes_read on public.wiki_notes;
create policy wiki_notes_read on public.wiki_notes
  for select
  to anon
  using (status <> 'declined');

-- Anonymous can INSERT, but only fresh open/unresolved notes — they
-- cannot pre-set a status or write a resolution.
drop policy if exists wiki_notes_insert on public.wiki_notes;
create policy wiki_notes_insert on public.wiki_notes
  for insert
  to anon
  with check (
    status = 'open'
    and resolution is null
    and resolved_at is null
    and char_length(body) between 1 and 4000
  );

-- No UPDATE / DELETE policies for anon. The triage workflow updates
-- status + resolution using the SERVICE ROLE key (bypasses RLS).

-- Optional spam hygiene to add later: a per-IP rate limit needs an Edge
-- Function (anon inserts don't carry a stable identity here); for v1 the
-- triage pass marks junk as 'declined' (which hides it from reads).
