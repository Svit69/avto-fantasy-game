create table if not exists users (
  id text primary key,
  payload jsonb not null
);

create table if not exists players (
  id text primary key,
  payload jsonb not null
);

create table if not exists rosters (
  user_id text not null,
  month text not null,
  payload jsonb not null,
  primary key (user_id, month)
);

create table if not exists calendar_tours (id text primary key, payload jsonb not null);
create table if not exists calendar_matches (id text primary key, payload jsonb not null);
create table if not exists opponent_teams (id text primary key, payload jsonb not null);
create table if not exists khl_matches (id text primary key, payload jsonb not null);
create table if not exists khl_events (id text primary key, match_id text not null, payload jsonb not null);
create table if not exists khl_point_entries (id text primary key, match_id text not null, payload jsonb not null);
create table if not exists khl_player_stats (
  match_id text not null,
  player_id text not null,
  payload jsonb not null,
  primary key (match_id, player_id)
);
create table if not exists khl_runs (id text primary key, payload jsonb not null);
create table if not exists khl_snapshots (id text primary key, payload jsonb not null);
create table if not exists notifications_sent (
  user_id text not null,
  key text not null,
  sent_at timestamptz not null default now(),
  payload jsonb not null default '{}'::jsonb,
  primary key (user_id, key)
);

create index if not exists idx_rosters_month on rosters(month);
create index if not exists idx_khl_events_match_id on khl_events(match_id);
create index if not exists idx_khl_points_match_id on khl_point_entries(match_id);
create index if not exists idx_khl_stats_player_id on khl_player_stats(player_id);
