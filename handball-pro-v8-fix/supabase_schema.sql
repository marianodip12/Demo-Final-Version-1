-- ═══════════════════════════════════════════════════
--  HANDBALL PRO v8 — Schema completo
--  Pegá todo en SQL Editor → Run
-- ═══════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ── EQUIPOS PROPIOS ───────────────────────────────
create table if not exists teams (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  color      text not null default '#3b82f6',
  created_at timestamptz default now()
);

-- ── JUGADORES DEL EQUIPO PROPIO ───────────────────
create table if not exists players (
  id         uuid primary key default gen_random_uuid(),
  team_id    uuid references teams(id) on delete cascade,
  name       text not null,
  number     int  not null,
  position   text not null default 'Campo',
  created_at timestamptz default now()
);

-- ── EQUIPOS RIVALES ───────────────────────────────
create table if not exists rival_teams (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  color      text default '#64748b',
  created_at timestamptz default now()
);

-- ── JUGADORES RIVALES ─────────────────────────────
create table if not exists rival_players (
  id             uuid primary key default gen_random_uuid(),
  rival_team_id  uuid references rival_teams(id) on delete cascade,
  name           text not null,
  number         int  not null,
  position       text default 'Campo',
  created_at     timestamptz default now()
);

-- ── TEMPORADAS ────────────────────────────────────
create table if not exists seasons (
  id          uuid primary key default gen_random_uuid(),
  year        int  not null,
  competition text not null, -- Liga, Copa, Super 8, Amistoso, Torneo Regional
  name        text generated always as (competition || ' ' || year::text) stored,
  created_at  timestamptz default now(),
  unique(year, competition)
);

-- ── PARTIDOS ──────────────────────────────────────
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
  round           text,   -- Jornada / Fecha
  venue           text,   -- Local / Visitante
  status          text default 'live', -- live | closed
  created_at      timestamptz default now()
);

-- ── EVENTOS ───────────────────────────────────────
create table if not exists events (
  id                uuid primary key default gen_random_uuid(),
  match_id          uuid references matches(id) on delete cascade,
  minute            int  not null default 1,
  team              text,             -- 'home' | 'away' | null
  type              text not null,    -- goal, miss, saved, turnover, exclusion...
  zone              text,
  quadrant          int,
  attack_side       text,
  distance          text,
  situation         text default 'igualdad',
  throw_type        text,
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

-- ── ROW LEVEL SECURITY (acceso público por ahora) ─
alter table teams         enable row level security;
alter table players       enable row level security;
alter table rival_teams   enable row level security;
alter table rival_players enable row level security;
alter table seasons       enable row level security;
alter table matches       enable row level security;
alter table events        enable row level security;

create policy "pub_teams"         on teams         for all using (true) with check (true);
create policy "pub_players"       on players       for all using (true) with check (true);
create policy "pub_rival_teams"   on rival_teams   for all using (true) with check (true);
create policy "pub_rival_players" on rival_players for all using (true) with check (true);
create policy "pub_seasons"       on seasons       for all using (true) with check (true);
create policy "pub_matches"       on matches       for all using (true) with check (true);
create policy "pub_events"        on events        for all using (true) with check (true);

-- ── DATOS INICIALES ───────────────────────────────
do $$
declare
  gei_id uuid;
  s_id   uuid;
begin
  -- Equipo GEI
  insert into teams (name, color) values ('GEI', '#ef4444') returning id into gei_id;
  insert into players (team_id, name, number, position) values
    (gei_id, 'García',    1,  'Arquero'),
    (gei_id, 'López',     5,  'Armador'),
    (gei_id, 'Martínez',  7,  'Extremo Izq.'),
    (gei_id, 'Pérez',     9,  'Pivote'),
    (gei_id, 'Rodríguez', 11, 'Lateral Izq.'),
    (gei_id, 'Torres',    13, 'Extremo Der.'),
    (gei_id, 'Morales',   5,  'Armador'),
    (gei_id, 'Ríos',      4,  'Lateral Der.'),
    (gei_id, 'Vera',      9,  'Pivote'),
    (gei_id, 'Ruiz',      6,  'Lateral Izq.');

  -- Temporadas de ejemplo
  insert into seasons (year, competition) values (2025, 'Liga') returning id into s_id;
  insert into seasons (year, competition) values (2025, 'Copa');
  insert into seasons (year, competition) values (2025, 'Super 8');
end $$;
