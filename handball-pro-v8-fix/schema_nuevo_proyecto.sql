-- ═══════════════════════════════════════════════════════════════
--  HANDBALL PRO — Schema completo para proyecto nuevo
--  Proyecto: emmqrzqxlkqvsqbihwdt.supabase.co
--
--  INSTRUCCIONES:
--  1. Abrí supabase.com → tu proyecto v9-9
--  2. Menú izquierdo → SQL Editor
--  3. Pegá TODO este contenido
--  4. Click en "Run" (o Ctrl+Enter)
--  ¡Listo! Todas las tablas quedan creadas.
-- ═══════════════════════════════════════════════════════════════

-- Extensión para UUIDs
create extension if not exists "pgcrypto";

-- ── 1. EQUIPOS PROPIOS ────────────────────────────────────────
create table if not exists teams (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  color      text not null default '#3b82f6',
  created_at timestamptz default now()
);

-- ── 2. JUGADORES DEL EQUIPO PROPIO ───────────────────────────
create table if not exists players (
  id         uuid primary key default gen_random_uuid(),
  team_id    uuid references teams(id) on delete cascade,
  name       text not null,
  number     int  not null,
  position   text not null default 'Campo',
  created_at timestamptz default now()
);

-- ── 3. EQUIPOS RIVALES ────────────────────────────────────────
create table if not exists rival_teams (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  color      text default '#64748b',
  created_at timestamptz default now()
);

-- ── 4. JUGADORES RIVALES ──────────────────────────────────────
create table if not exists rival_players (
  id             uuid primary key default gen_random_uuid(),
  rival_team_id  uuid references rival_teams(id) on delete cascade,
  name           text not null,
  number         int  not null,
  position       text default 'Campo',
  created_at     timestamptz default now()
);

-- ── 5. TEMPORADAS ─────────────────────────────────────────────
create table if not exists seasons (
  id          uuid primary key default gen_random_uuid(),
  year        int  not null,
  competition text not null,
  name        text generated always as (competition || ' ' || year::text) stored,
  created_at  timestamptz default now(),
  unique(year, competition)
);

-- ── 6. PARTIDOS ───────────────────────────────────────────────
create table if not exists matches (
  id              uuid primary key default gen_random_uuid(),
  season_id       uuid references seasons(id) on delete set null,
  home_team_id    uuid references teams(id) on delete set null,
  away_rival_id   uuid references rival_teams(id) on delete set null,
  home_name       text not null,
  away_name       text not null,
  home_color      text default '#ef4444',
  away_color      text default '#64748b',
  home_score      int  default 0,
  away_score      int  default 0,
  match_date      text,
  competition     text default 'Liga',
  season_year     int,
  round           text,
  venue           text,
  status          text default 'live',  -- 'live' | 'closed'
  created_at      timestamptz default now()
);

-- ── 7. EVENTOS ────────────────────────────────────────────────
--  Tabla principal donde se guardan todos los registros del partido
create table if not exists events (
  id                uuid primary key default gen_random_uuid(),
  match_id          uuid references matches(id) on delete cascade,
  minute            int  not null default 1,
  team              text,             -- 'home' | 'away'
  type              text not null,    -- goal | miss | saved | turnover | exclusion |
                                      -- timeout | red_card | yellow_card | blue_card | half_time
  zone              text,             -- left_wing | left_back | center | right_back |
                                      -- right_wing | pivot | penal
  quadrant          int,              -- 0-8 (cuadrante del arco 3x3)
  attack_side       text,             -- left | center | right
  distance          text,             -- 6m | 9m | 12m | penal | arco
  situation         text default 'igualdad',  -- igualdad | superioridad | inferioridad
  throw_type        text,             -- salto | habilidad | finta | penetracion | otro
  shooter_name      text,
  shooter_number    int,
  goalkeeper_name   text,
  goalkeeper_number int,
  sanctioned_name   text,
  sanctioned_number int,
  h_score           int  default 0,
  a_score           int  default 0,
  completed         boolean default false,
  quick_mode        boolean default false,
  created_at        timestamptz default now()
);

-- ── 8. ÍNDICES para mejor performance ────────────────────────
create index if not exists idx_events_match_id   on events(match_id);
create index if not exists idx_events_type        on events(type);
create index if not exists idx_events_team        on events(team);
create index if not exists idx_players_team_id   on players(team_id);
create index if not exists idx_matches_status     on matches(status);
create index if not exists idx_matches_created   on matches(created_at desc);

-- ── 9. ROW LEVEL SECURITY ─────────────────────────────────────
--  Acceso público completo (la app usa publishable key)
alter table teams         enable row level security;
alter table players       enable row level security;
alter table rival_teams   enable row level security;
alter table rival_players enable row level security;
alter table seasons       enable row level security;
alter table matches       enable row level security;
alter table events        enable row level security;

-- Políticas: acceso total con publishable key
create policy "pub_read_write_teams"
  on teams for all using (true) with check (true);

create policy "pub_read_write_players"
  on players for all using (true) with check (true);

create policy "pub_read_write_rival_teams"
  on rival_teams for all using (true) with check (true);

create policy "pub_read_write_rival_players"
  on rival_players for all using (true) with check (true);

create policy "pub_read_write_seasons"
  on seasons for all using (true) with check (true);

create policy "pub_read_write_matches"
  on matches for all using (true) with check (true);

create policy "pub_read_write_events"
  on events for all using (true) with check (true);

-- ── 10. TEMPORADAS BASE 2025 ──────────────────────────────────
insert into seasons (year, competition) values
  (2025, 'Liga'),
  (2025, 'Copa'),
  (2025, 'Super 8'),
  (2025, 'Amistoso'),
  (2025, 'Torneo Regional')
on conflict (year, competition) do nothing;

-- ── 11. VISTAS ÚTILES ─────────────────────────────────────────

-- Vista: stats de goles por zona por partido
create or replace view public.v_zone_stats as
select
  e.match_id,
  m.home_name,
  m.away_name,
  e.team,
  e.zone,
  count(*) filter (where e.type = 'goal')  as goals,
  count(*) filter (where e.type = 'saved') as saved,
  count(*) filter (where e.type = 'miss')  as miss,
  count(*)                                  as total
from events e
join matches m on m.id = e.match_id
where e.zone is not null
  and e.type in ('goal', 'saved', 'miss')
group by e.match_id, m.home_name, m.away_name, e.team, e.zone;

-- Vista: goleadores por partido
create or replace view public.v_shooter_stats as
select
  e.match_id,
  m.home_name,
  m.away_name,
  e.team,
  e.shooter_name,
  e.shooter_number,
  count(*) filter (where e.type = 'goal')  as goals,
  count(*) filter (where e.type = 'saved') as saved,
  count(*) filter (where e.type = 'miss')  as miss,
  count(*)                                  as shots
from events e
join matches m on m.id = e.match_id
where e.shooter_name is not null
  and e.type in ('goal', 'saved', 'miss')
group by e.match_id, m.home_name, m.away_name, e.team, e.shooter_name, e.shooter_number;

-- Vista: stats arquero por partido
create or replace view public.v_goalkeeper_stats as
select
  e.match_id,
  m.home_name,
  m.away_name,
  e.team,
  e.goalkeeper_name,
  e.goalkeeper_number,
  e.quadrant,
  count(*) filter (where e.type = 'saved') as saved,
  count(*) filter (where e.type = 'goal')  as goals_conceded,
  count(*) filter (where e.type = 'miss')  as miss,
  count(*)                                  as total
from events e
join matches m on m.id = e.match_id
where e.goalkeeper_name is not null
  and e.type in ('goal', 'saved', 'miss')
group by e.match_id, m.home_name, m.away_name, e.team, e.goalkeeper_name, e.goalkeeper_number, e.quadrant;

-- ═══════════════════════════════════════════════════════════════
--  ✅ SCHEMA CREADO CORRECTAMENTE
--  Tablas: teams, players, rival_teams, rival_players,
--          seasons, matches, events
--  Vistas: v_zone_stats, v_shooter_stats, v_goalkeeper_stats
--  RLS: habilitado con acceso público
-- ═══════════════════════════════════════════════════════════════
