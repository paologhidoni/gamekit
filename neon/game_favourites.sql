-- Run against Neon (SQL Editor or psql with DATABASE_URL).
-- Table + RLS for client-side favourites via Neon Data API.

create table if not exists public.game_favourites (
  user_id uuid not null,
  game_id integer not null,
  created_at timestamptz not null default now(),
  primary key (user_id, game_id)
);

create index if not exists game_favourites_user_created_at_idx
  on public.game_favourites (user_id, created_at desc);

alter table public.game_favourites enable row level security;

-- Data API authenticated role grants
grant usage on schema public to authenticated;
grant select, insert, delete on public.game_favourites to authenticated;

create policy "Users select own favourites"
  on public.game_favourites
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users insert own favourites"
  on public.game_favourites
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users delete own favourites"
  on public.game_favourites
  for delete
  to authenticated
  using (auth.uid() = user_id);
