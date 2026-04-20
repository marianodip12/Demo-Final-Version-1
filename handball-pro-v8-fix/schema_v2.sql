-- ═══════════════════════════════════════════════════════════════
--  HANDBALL PRO — Schema v2
--  Ejecutar en Supabase SQL Editor.
--  ⚠ BORRA TODO LO ANTERIOR y recrea desde cero.
-- ═══════════════════════════════════════════════════════════════

-- 0. LIMPIAR TABLAS ANTERIORES (en orden por FK)
drop table if exists events         cascade;
drop table if exists matches        cascade;
drop table if exists seasons        cascade;
drop table if exists rival_players  cascade;
drop table if exists rival_teams    cascade;
drop table if exists players        cascade;
drop table if exists teams          cascade;

drop view if exists public.v_zone_stats;
drop view if exists public.v_shooter_stats;
drop view if exists public.v_goalkeeper_stats;
drop view if exists public.v_quadrant_stats;

create extension if not exists "pgcrypto";

-- ── 1. EQUIPOS ────────────────────────────────────────────────
create table teams (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  short_name text,
  color      text not null default '#3b82f6',
  created_at timestamptz default now()
);

-- ── 2. JUGADORES ──────────────────────────────────────────────
create table players (
  id         uuid primary key default gen_random_uuid(),
  team_id    uuid references teams(id) on delete cascade,
  name       text not null,
  number     int  not null,
  position   text not null default 'Campo',
  created_at timestamptz default now()
);

-- ── 3. EQUIPOS RIVALES ────────────────────────────────────────
create table rival_teams (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  color      text default '#64748b',
  created_at timestamptz default now()
);

-- ── 4. JUGADORES RIVALES ──────────────────────────────────────
create table rival_players (
  id             uuid primary key default gen_random_uuid(),
  rival_team_id  uuid references rival_teams(id) on delete cascade,
  name           text not null,
  number         int  not null,
  position       text default 'Campo',
  created_at     timestamptz default now()
);

-- ── 5. TEMPORADAS ─────────────────────────────────────────────
create table seasons (
  id          uuid primary key default gen_random_uuid(),
  year        int  not null,
  competition text not null,
  name        text generated always as (competition || ' ' || year::text) stored,
  created_at  timestamptz default now(),
  unique(year, competition)
);

-- ── 6. PARTIDOS ───────────────────────────────────────────────
create table matches (
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
  status          text default 'live',   -- 'live' | 'closed'
  created_at      timestamptz default now()
);

-- ── 7. EVENTOS ────────────────────────────────────────────────
create table events (
  id                uuid    primary key default gen_random_uuid(),
  match_id          uuid    references matches(id) on delete cascade,
  minute            int     not null default 1,
  team              text,            -- 'home' | 'away'

  -- Tipo de evento
  type              text not null,
  -- Tiros al arco:     'goal' | 'saved' | 'miss' | 'post'
  -- Disciplina:        'exclusion' | 'red_card' | 'yellow_card' | 'blue_card'
  -- Juego:             'turnover' | 'timeout' | 'half_time'

  -- Zona de la cancha (nueva nomenclatura)
  zone              text,
  -- 'extreme_left' | 'lateral_left' | 'center_above' | 'lateral_right' | 'extreme_right'
  -- 'near_left'    | 'near_center'  | 'near_right'   | '7m'

  -- Cuadrante del arco (0-8, grilla 3x3)
  quadrant          int,
  -- 0:ArrIzq 1:ArrCen 2:ArrDer
  -- 3:MedIzq 4:MedCen 5:MedDer
  -- 6:AbjIzq 7:AbjCen 8:AbjDer

  -- Sección del arco (para palo/fuera)
  goal_section      text,
  -- 0-8 (igual a quadrant) | 'palo' | 'fuera'

  -- Contexto del tiro
  situation         text default 'igualdad',
  -- 'igualdad' | 'superioridad' | 'inferioridad'

  -- Jugadores involucrados
  shooter_name      text,
  shooter_number    int,
  goalkeeper_name   text,
  goalkeeper_number int,
  sanctioned_name   text,
  sanctioned_number int,

  -- Marcador al momento del evento
  h_score           int default 0,
  a_score           int default 0,

  -- Flags
  completed         boolean default false,
  quick_mode        boolean default false,

  created_at        timestamptz default now()
);

-- ── 8. ÍNDICES ────────────────────────────────────────────────
create index idx_events_match_id  on events(match_id);
create index idx_events_type      on events(type);
create index idx_events_team      on events(team);
create index idx_events_zone      on events(zone);
create index idx_events_quadrant  on events(quadrant);
create index idx_players_team_id  on players(team_id);
create index idx_matches_status   on matches(status);
create index idx_matches_created  on matches(created_at desc);

-- ── 9. RLS ────────────────────────────────────────────────────
alter table teams         enable row level security;
alter table players       enable row level security;
alter table rival_teams   enable row level security;
alter table rival_players enable row level security;
alter table seasons       enable row level security;
alter table matches       enable row level security;
alter table events        enable row level security;

create policy "pub_all_teams"         on teams         for all using (true) with check (true);
create policy "pub_all_players"       on players       for all using (true) with check (true);
create policy "pub_all_rival_teams"   on rival_teams   for all using (true) with check (true);
create policy "pub_all_rival_players" on rival_players for all using (true) with check (true);
create policy "pub_all_seasons"       on seasons       for all using (true) with check (true);
create policy "pub_all_matches"       on matches       for all using (true) with check (true);
create policy "pub_all_events"        on events        for all using (true) with check (true);

-- ── 10. TEMPORADAS BASE ───────────────────────────────────────
insert into seasons (year, competition) values
  (2025, 'Liga'), (2025, 'Copa'), (2025, 'Super 8'),
  (2025, 'Amistoso'), (2025, 'Torneo Regional'),
  (2026, 'Liga'), (2026, 'Copa'), (2026, 'Amistoso')
on conflict (year, competition) do nothing;

-- ── 11. VISTAS ────────────────────────────────────────────────

-- Stats por zona por partido y equipo
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
  count(*) filter (where e.type = 'post')  as post,
  count(*)                                  as total
from events e
join matches m on m.id = e.match_id
where e.zone is not null
  and e.type in ('goal', 'saved', 'miss', 'post')
group by e.match_id, m.home_name, m.away_name, e.team, e.zone;

-- Stats por cuadrante del arco
create or replace view public.v_quadrant_stats as
select
  e.match_id,
  e.team,
  e.quadrant,
  e.goal_section,
  count(*) filter (where e.type = 'goal')  as goals,
  count(*) filter (where e.type = 'saved') as saved,
  count(*) filter (where e.type = 'miss')  as miss,
  count(*) filter (where e.type = 'post')  as post,
  count(*)                                  as total
from events e
where e.type in ('goal', 'saved', 'miss', 'post')
group by e.match_id, e.team, e.quadrant, e.goal_section;

-- Goleadores
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
  count(*) filter (where e.type = 'post')  as post,
  count(*)                                  as shots
from events e
join matches m on m.id = e.match_id
where e.shooter_name is not null
  and e.type in ('goal', 'saved', 'miss', 'post')
group by e.match_id, m.home_name, m.away_name, e.team, e.shooter_name, e.shooter_number;

-- Stats arquero por cuadrante
-- % arquero = saved / (saved + goals_conceded)   [tiros al arco = excluye miss y post]
create or replace view public.v_goalkeeper_stats as
select
  e.match_id,
  m.home_name,
  m.away_name,
  e.team,
  e.goalkeeper_name,
  e.goalkeeper_number,
  e.quadrant,
  e.goal_section,
  count(*) filter (where e.type = 'saved')  as saved,
  count(*) filter (where e.type = 'goal')   as goals_conceded,
  -- % = saved / (saved + goals_conceded)
  case
    when count(*) filter (where e.type in ('saved','goal')) > 0
    then round(
      count(*) filter (where e.type = 'saved')::numeric
      / count(*) filter (where e.type in ('saved','goal'))::numeric * 100
    )
    else 0
  end as save_pct
from events e
join matches m on m.id = e.match_id
where e.goalkeeper_name is not null
  and e.type in ('goal', 'saved')
group by e.match_id, m.home_name, m.away_name, e.team,
         e.goalkeeper_name, e.goalkeeper_number, e.quadrant, e.goal_section;

-- ═══════════════════════════════════════════════════════════════
--  ✅ Schema v2 listo.
--  Zonas nuevas:  extreme_left | lateral_left | center_above |
--                 lateral_right | extreme_right | near_left |
--                 near_center | near_right | 7m
--  Tipos nuevos:  goal | saved | miss | post
--  goal_section:  0-8 | 'palo' | 'fuera'
--  % arquero:     saved / (saved + goals_conceded)
-- ═══════════════════════════════════════════════════════════════
