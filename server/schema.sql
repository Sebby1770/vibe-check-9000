-- Shared world for future multiplayer. Mirrors the local SQLite tables (js/db/schema.js) with a player_id,
-- for Postgres 15+ (works on Supabase). Not used by the game until a sync adapter is configured
-- (js/db/sync.js); nothing in the shipped game connects to a server.

create extension if not exists pgcrypto;

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  handle text unique,
  created_at timestamptz not null default now()
);

create table if not exists saves (
  player_id uuid not null references players(id) on delete cascade,
  slot text not null default 'main',
  seq bigint not null,
  saved_at timestamptz not null default now(),
  data jsonb not null,
  primary key (player_id, slot)
);

create table if not exists items (
  player_id uuid not null references players(id) on delete cascade,
  id text not null,
  kind text not null,
  qty integer not null default 1,
  data jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  primary key (player_id, id)
);

-- World objects are shared: one row per object, last writer wins, positioned on the same 64 m grid.
create table if not exists entities (
  id text primary key,
  kind text not null,
  x double precision not null, y double precision not null default 0, z double precision not null,
  yaw double precision not null default 0,
  cell integer not null,
  state jsonb not null default '{}',
  updated_by uuid references players(id) on delete set null,
  updated_at timestamptz not null default now()
);
create index if not exists entities_cell on entities (cell, kind);

create table if not exists npc_state (
  player_id uuid not null references players(id) on delete cascade,
  id text not null,
  x double precision, z double precision, yaw double precision,
  mood text, memory jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  primary key (player_id, id)
);

create table if not exists story (
  player_id uuid not null references players(id) on delete cascade,
  quest text not null, state text not null, step integer not null default 0, data jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  primary key (player_id, quest)
);

create table if not exists presence (
  player_id uuid primary key references players(id) on delete cascade,
  x double precision not null, z double precision not null, yaw double precision not null default 0,
  zone text, seen_at timestamptz not null default now()
);

-- Row-level security: players read and write only their own rows; entities and presence are readable by all.
alter table players enable row level security;
alter table saves enable row level security;
alter table items enable row level security;
alter table entities enable row level security;
alter table npc_state enable row level security;
alter table story enable row level security;
alter table presence enable row level security;

create policy own_player on players for all using (id = auth.uid()) with check (id = auth.uid());
create policy own_saves on saves for all using (player_id = auth.uid()) with check (player_id = auth.uid());
create policy own_items on items for all using (player_id = auth.uid()) with check (player_id = auth.uid());
create policy own_npcs on npc_state for all using (player_id = auth.uid()) with check (player_id = auth.uid());
create policy own_story on story for all using (player_id = auth.uid()) with check (player_id = auth.uid());
create policy read_entities on entities for select using (true);
create policy write_entities on entities for insert with check (updated_by = auth.uid());
create policy update_entities on entities for update using (true) with check (updated_by = auth.uid());
create policy read_presence on presence for select using (true);
create policy own_presence on presence for all using (player_id = auth.uid()) with check (player_id = auth.uid());

-- Applies a batch of outbox rows from js/db/sync.js for the calling player.
create or replace function apply_outbox(player uuid, rows jsonb) returns integer
language plpgsql security invoker as $$
declare r jsonb; n integer := 0;
begin
  if player is distinct from auth.uid() then raise exception 'player mismatch'; end if;
  for r in select * from jsonb_array_elements(rows) loop
    if r->>'tbl' = 'items' and r->>'op' = 'upsert' then
      insert into items(player_id, id, kind, qty, data) values (player, r->'row'->>'id', r->'row'->>'kind',
        coalesce((r->'row'->>'qty')::int, 1), coalesce((r->'row'->>'data')::jsonb, '{}'))
      on conflict (player_id, id) do update set kind = excluded.kind, qty = excluded.qty, data = excluded.data, updated_at = now();
    elsif r->>'tbl' = 'items' and r->>'op' = 'delete' then
      delete from items where player_id = player and id = r->>'rowId';
    elsif r->>'tbl' = 'story' and r->>'op' = 'upsert' then
      insert into story(player_id, quest, state, step, data) values (player, r->'row'->>'quest', r->'row'->>'state',
        coalesce((r->'row'->>'step')::int, 0), coalesce((r->'row'->>'data')::jsonb, '{}'))
      on conflict (player_id, quest) do update set state = excluded.state, step = excluded.step, data = excluded.data, updated_at = now();
    elsif r->>'tbl' = 'entities' and r->>'op' = 'upsert' then
      insert into entities(id, kind, x, y, z, yaw, cell, state, updated_by) values (r->'row'->>'id', r->'row'->>'kind',
        (r->'row'->>'x')::float8, (r->'row'->>'y')::float8, (r->'row'->>'z')::float8, (r->'row'->>'yaw')::float8,
        (r->'row'->>'cell')::int, coalesce((r->'row'->>'state')::jsonb, '{}'), player)
      on conflict (id) do update set x = excluded.x, y = excluded.y, z = excluded.z, yaw = excluded.yaw, cell = excluded.cell,
        state = excluded.state, updated_by = player, updated_at = now();
    end if;
    n := n + 1;
  end loop;
  return n;
end $$;
