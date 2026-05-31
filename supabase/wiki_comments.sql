-- MY LIFE IS AN RPG — community discussion + owner notes (wiki)
-- docs/design/community-discussion.md. Replaces wiki_notes (clean-slate).
--
-- Run in the Supabase SQL editor. Then: Authentication → enable Email (magic
-- link) and RESTRICT sign-ups to the owner email only (Auth → Providers →
-- Email → "Allow new users to sign up" OFF, or an allowlist). Public stays
-- anonymous (anon key); the one authenticated account IS the owner.

-- ── Tables ───────────────────────────────────────────────────────────────
create table if not exists wiki_comments (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  anchor       text not null,                       -- e.g. arc:day-7:event:evt-2:reply:c
  anchor_label text,
  content_hash text,                                -- hash of the area's text at post time
  data_run     text,
  data_version text,
  parent_id    uuid references wiki_comments(id) on delete cascade,  -- 1-level replies
  body         text not null check (char_length(body) between 1 and 4000),
  author       text not null default 'anon',
  author_role  text not null default 'anon' check (author_role in ('anon','owner')),
  is_note      boolean not null default false,      -- true ONLY for owner comments
  note_status  text check (note_status in ('open','applied','declined','discuss','superseded')),
  hidden       boolean not null default false,
  owner_id     uuid                                 -- auth.uid() for owner comments
);
create index if not exists wiki_comments_anchor_idx on wiki_comments(anchor);
create index if not exists wiki_comments_parent_idx on wiki_comments(parent_id);

create table if not exists wiki_comment_votes (
  comment_id  uuid not null references wiki_comments(id) on delete cascade,
  voter_token text not null,                        -- per-visitor uuid (localStorage)
  created_at  timestamptz not null default now(),
  primary key (comment_id, voter_token)             -- server-enforced one-like-per-visitor
);

-- ── Scored view (RLS-aware) ────────────────────────────────────────────────
create or replace view wiki_comments_scored
  with (security_invoker = true) as
  select c.*, coalesce(v.score, 0) as score
  from wiki_comments c
  left join (
    select comment_id, count(*)::int as score
    from wiki_comment_votes group by comment_id
  ) v on v.comment_id = c.id;

-- ── RLS ────────────────────────────────────────────────────────────────────
alter table wiki_comments enable row level security;
alter table wiki_comment_votes enable row level security;

-- Read: anyone sees non-hidden comments.
create policy comments_read on wiki_comments for select using (hidden = false);

-- Anonymous insert: forced to a plain public comment (never a note/owner/hidden).
create policy comments_insert_anon on wiki_comments for insert to anon
  with check (
    author_role = 'anon' and is_note = false and note_status is null
    and hidden = false and owner_id is null
  );

-- Owner (any authenticated user — sign-ups are restricted to the owner):
-- may post owner comments and edit note flags/status/visibility on anything.
create policy comments_insert_owner on wiki_comments for insert to authenticated
  with check (author_role = 'owner' and owner_id = auth.uid());
create policy comments_update_owner on wiki_comments for update to authenticated
  using (true) with check (true);

-- Votes: anyone may read; insert/delete one row per (comment, token).
create policy votes_read   on wiki_comment_votes for select using (true);
create policy votes_insert on wiki_comment_votes for insert with check (true);
create policy votes_delete on wiki_comment_votes for delete using (true);
