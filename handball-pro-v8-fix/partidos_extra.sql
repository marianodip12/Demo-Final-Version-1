-- ═══════════════════════════════════════════════════
--  HANDBALL PRO v8 — 2 PARTIDOS MÁS
--  Pegá en SQL Editor → Run
-- ═══════════════════════════════════════════════════

do $$
declare
  gei_id  uuid;
  dep_id  uuid;
  san_id  uuid;
  m1      uuid;
  m2      uuid;
begin

  select id into gei_id from teams where name = 'GEI' limit 1;

  -- Rivales
  insert into rival_teams (name, color) values ('Deportivo Sur', '#22c55e') on conflict (name) do nothing;
  insert into rival_teams (name, color) values ('San Lorenzo HC', '#f59e0b') on conflict (name) do nothing;
  select id into dep_id from rival_teams where name = 'Deportivo Sur';
  select id into san_id from rival_teams where name = 'San Lorenzo HC';

  insert into rival_players (rival_team_id, name, number, position) values
    (dep_id, 'Ríos',    1,  'Arquero'),
    (dep_id, 'Peralta', 5,  'Armador'),
    (dep_id, 'Lemos',   7,  'Extremo Izq.'),
    (dep_id, 'Funes',   9,  'Pivote'),
    (dep_id, 'Nieto',   11, 'Lateral Izq.'),
    (dep_id, 'Cabral',  13, 'Lateral Der.'),
    (dep_id, 'Vidal',   3,  'Extremo Der.')
  on conflict do nothing;

  insert into rival_players (rival_team_id, name, number, position) values
    (san_id, 'Blanco',  1,  'Arquero'),
    (san_id, 'Coria',   4,  'Armador'),
    (san_id, 'Medina',  7,  'Extremo Izq.'),
    (san_id, 'Palma',   9,  'Pivote'),
    (san_id, 'Juárez',  11, 'Lateral Der.'),
    (san_id, 'Leiva',   13, 'Lateral Izq.'),
    (san_id, 'Álvarez', 6,  'Extremo Der.')
  on conflict do nothing;

-- ════════════════════════════════════════════════════
--  PARTIDO 1: GEI 20 – 17 Deportivo Sur
--  Copa | Cuartos | Partido sufrido, remontada GEI
-- ════════════════════════════════════════════════════
  insert into matches (home_team_id, home_name, away_name, away_rival_id,
    home_color, away_color, home_score, away_score,
    match_date, competition, round, status)
  values (gei_id,'GEI','Deportivo Sur',dep_id,'#ef4444','#22c55e',
    20,17,'29/03','Copa','Cuartos de Final','closed')
  returning id into m1;

  insert into events (match_id,minute,team,type,zone,quadrant,
    shooter_name,shooter_number,goalkeeper_name,goalkeeper_number,
    h_score,a_score,completed,situation,distance,throw_type) values

  (m1,1,'away','goal','center',4,'Peralta',5,'García',1,0,1,true,'igualdad','9m','salto'),
  (m1,2,'home','miss','left_back',3,'Martínez',7,'Ríos',1,0,1,true,'igualdad','9m','salto'),
  (m1,3,'away','goal','pivot',7,'Funes',9,'García',1,0,2,true,'igualdad','6m','penetracion'),
  (m1,4,'home','goal','center',4,'López',5,'Ríos',1,1,2,true,'igualdad','9m','habilidad'),
  (m1,5,'away','saved','right_back',2,'Cabral',13,'García',1,1,2,true,'igualdad','9m','salto'),
  (m1,6,'home','saved','pivot',3,'Vera',9,'Ríos',1,1,2,true,'igualdad','6m','penetracion'),
  (m1,7,'away','goal','left_wing',6,'Lemos',7,'García',1,1,3,true,'igualdad','6m','finta'),
  (m1,8,'home','exclusion',null,null,'Torres',13,null,null,1,3,true,'igualdad',null,null),
  (m1,9,'away','goal','center',1,'Peralta',5,'García',1,1,4,true,'superioridad','9m','salto'),
  (m1,10,'home','goal','right_wing',2,'Ruiz',6,'Ríos',1,2,4,true,'inferioridad','6m','finta'),
  (m1,11,'home','timeout',null,null,null,null,null,null,2,4,true,null,null,null),
  (m1,12,'home','goal','center',4,'Morales',5,'Ríos',1,3,4,true,'igualdad','9m','salto'),
  (m1,13,'away','miss','left_back',0,'Nieto',11,'García',1,3,4,true,'igualdad','9m','habilidad'),
  (m1,14,'home','goal','left_back',1,'Pérez',9,'Ríos',1,4,4,true,'igualdad','9m','salto'),
  (m1,15,'away','goal','pivot',3,'Funes',9,'García',1,4,5,true,'igualdad','6m','penetracion'),
  (m1,16,'home','saved','center',4,'López',5,'Ríos',1,4,5,true,'igualdad','9m','habilidad'),
  (m1,17,'away','exclusion',null,null,'Cabral',13,null,null,4,5,true,'igualdad',null,null),
  (m1,18,'home','goal','left_back',2,'Martínez',7,'Ríos',1,5,5,true,'superioridad','9m','finta'),
  (m1,19,'away','goal','right_wing',8,'Vidal',3,'García',1,5,6,true,'igualdad','6m','salto'),
  (m1,20,'home','goal','pivot',7,'Vera',9,'Ríos',1,6,6,true,'igualdad','6m','penetracion'),
  (m1,21,'away','saved','center',4,'Peralta',5,'García',1,6,6,true,'igualdad','9m','salto'),
  (m1,22,'home','miss','right_back',5,'Rodríguez',11,'Ríos',1,6,6,true,'igualdad','9m','salto'),
  (m1,23,'away','goal','left_back',3,'Nieto',11,'García',1,6,7,true,'igualdad','9m','habilidad'),
  (m1,24,'home','goal','center',4,'López',5,'Ríos',1,7,7,true,'igualdad','9m','salto'),
  (m1,25,'away','yellow_card',null,null,'Funes',9,null,null,7,7,true,'igualdad',null,null),
  (m1,26,'home','goal','left_wing',0,'Martínez',7,'Ríos',1,8,7,true,'igualdad','6m','finta'),
  (m1,27,'away','goal','center',4,'Peralta',5,'García',1,8,8,true,'igualdad','9m','salto'),
  (m1,28,'home','saved','right_back',2,'Ríos_p',4,'Ríos',1,8,8,true,'igualdad','9m','salto'),
  (m1,29,'home','goal','pivot',3,'Pérez',9,'Ríos',1,9,8,true,'igualdad','6m','penetracion'),
  (m1,30,null,'half_time',null,null,null,null,null,null,9,10,true,null,null,null),

  -- 2da parte — Sur pone 10-9, GEI remonta
  (m1,31,'away','goal','center',4,'Peralta',5,'García',1,9,11,true,'igualdad','9m','salto'),
  (m1,32,'home','goal','center',1,'López',5,'Ríos',1,10,11,true,'igualdad','9m','habilidad'),
  (m1,33,'away','miss','pivot',7,'Funes',9,'García',1,10,11,true,'igualdad','6m','penetracion'),
  (m1,34,'home','goal','left_back',3,'Martínez',7,'Ríos',1,11,11,true,'igualdad','9m','finta'),
  (m1,35,'away','saved','right_wing',2,'Vidal',3,'García',1,11,11,true,'igualdad','6m','finta'),
  (m1,36,'home','goal','pivot',7,'Vera',9,'Ríos',1,12,11,true,'igualdad','6m','penetracion'),
  (m1,37,'away','exclusion',null,null,'Nieto',11,null,null,12,11,true,'igualdad',null,null),
  (m1,38,'home','goal','center',4,'Morales',5,'Ríos',1,13,11,true,'superioridad','9m','salto'),
  (m1,39,'away','goal','left_back',1,'Nieto',11,'García',1,13,12,true,'inferioridad','9m','habilidad'),
  (m1,40,'home','goal','right_back',2,'Rodríguez',11,'Ríos',1,14,12,true,'igualdad','9m','salto'),
  (m1,41,'away','timeout',null,null,null,null,null,null,14,12,true,null,null,null),
  (m1,42,'away','goal','center',4,'Peralta',5,'García',1,14,13,true,'igualdad','9m','salto'),
  (m1,43,'home','saved','left_back',3,'Pérez',9,'Ríos',1,14,13,true,'igualdad','9m','salto'),
  (m1,44,'home','goal','pivot',3,'Vera',9,'Ríos',1,15,13,true,'igualdad','6m','penetracion'),
  (m1,45,'away','miss','center',4,'Cabral',13,'García',1,15,13,true,'igualdad','9m','salto'),
  (m1,46,'home','goal','left_wing',6,'Martínez',7,'Ríos',1,16,13,true,'igualdad','6m','finta'),
  (m1,47,'away','goal','pivot',7,'Funes',9,'García',1,16,14,true,'igualdad','6m','penetracion'),
  (m1,48,'home','miss','center',4,'López',5,'Ríos',1,16,14,true,'igualdad','9m','salto'),
  (m1,49,'away','saved','right_back',5,'Cabral',13,'García',1,16,14,true,'igualdad','9m','habilidad'),
  (m1,50,'home','goal','center',1,'Morales',5,'Ríos',1,17,14,true,'igualdad','9m','habilidad'),
  (m1,51,'away','goal','left_wing',0,'Lemos',7,'García',1,17,15,true,'igualdad','6m','finta'),
  (m1,52,'home','exclusion',null,null,'Ríos_p',4,null,null,17,15,true,'igualdad',null,null),
  (m1,53,'away','miss','center',4,'Peralta',5,'García',1,17,15,true,'superioridad','9m','salto'),
  (m1,54,'home','goal','right_wing',2,'Ruiz',6,'Ríos',1,18,15,true,'inferioridad','6m','finta'),
  (m1,55,'away','goal','right_back',5,'Cabral',13,'García',1,18,16,true,'igualdad','9m','salto'),
  (m1,56,'home','saved','pivot',7,'Funes',9,'Ríos',1,18,16,true,'igualdad','6m','penetracion'),
  (m1,57,'home','goal','center',4,'López',5,'Ríos',1,19,16,true,'igualdad','9m','salto'),
  (m1,58,'away','miss','left_back',3,'Nieto',11,'García',1,19,16,true,'igualdad','9m','salto'),
  (m1,59,'away','goal','pivot',3,'Funes',9,'García',1,19,17,true,'igualdad','6m','penetracion'),
  (m1,60,'home','goal','center',4,'Pérez',9,'Ríos',1,20,17,true,'igualdad','penal','otro');

-- ════════════════════════════════════════════════════
--  PARTIDO 2: San Lorenzo HC 22 – 24 GEI
--  Liga | Jornada 5 | GEI gana de visitante
-- ════════════════════════════════════════════════════
  insert into matches (home_team_id, home_name, away_name, away_rival_id,
    home_color, away_color, home_score, away_score,
    match_date, competition, round, status)
  values (gei_id,'San Lorenzo HC','GEI',san_id,'#f59e0b','#ef4444',
    22,24,'05/04','Liga','Jornada 5','closed')
  returning id into m2;

  insert into events (match_id,minute,team,type,zone,quadrant,
    shooter_name,shooter_number,goalkeeper_name,goalkeeper_number,
    h_score,a_score,completed,situation,distance,throw_type) values

  (m2,1,'home','goal','center',4,'Coria',4,'García',1,1,0,true,'igualdad','9m','salto'),
  (m2,2,'away','goal','left_back',1,'Martínez',7,'Blanco',1,1,1,true,'igualdad','9m','finta'),
  (m2,3,'home','goal','pivot',3,'Palma',9,'García',1,2,1,true,'igualdad','6m','penetracion'),
  (m2,4,'away','saved','center',4,'López',5,'Blanco',1,2,1,true,'igualdad','9m','salto'),
  (m2,5,'home','miss','left_back',0,'Leiva',13,'García',1,2,1,true,'igualdad','9m','habilidad'),
  (m2,6,'away','goal','pivot',7,'Vera',9,'Blanco',1,2,2,true,'igualdad','6m','penetracion'),
  (m2,7,'home','exclusion',null,null,'Juárez',11,null,null,2,2,true,'igualdad',null,null),
  (m2,8,'away','goal','center',4,'Morales',5,'Blanco',1,2,3,true,'superioridad','9m','habilidad'),
  (m2,9,'home','goal','right_back',5,'Juárez',11,'García',1,3,3,true,'inferioridad','9m','salto'),
  (m2,10,'away','miss','left_wing',6,'Martínez',7,'Blanco',1,3,3,true,'igualdad','6m','finta'),
  (m2,11,'home','goal','center',1,'Coria',4,'García',1,4,3,true,'igualdad','9m','salto'),
  (m2,12,'away','goal','right_back',2,'Ríos',4,'Blanco',1,4,4,true,'igualdad','9m','salto'),
  (m2,13,'home','saved','pivot',7,'Palma',9,'García',1,4,4,true,'igualdad','6m','penetracion'),
  (m2,14,'away','goal','center',4,'Pérez',9,'Blanco',1,4,5,true,'igualdad','6m','penetracion'),
  (m2,15,'home','goal','left_back',3,'Leiva',13,'García',1,5,5,true,'igualdad','9m','habilidad'),
  (m2,16,'away','saved','left_back',1,'Vera',9,'Blanco',1,5,5,true,'igualdad','6m','finta'),
  (m2,17,'home','timeout',null,null,null,null,null,null,5,5,true,null,null,null),
  (m2,18,'home','goal','center',4,'Medina',7,'García',1,6,5,true,'igualdad','9m','salto'),
  (m2,19,'away','goal','pivot',3,'López',5,'Blanco',1,6,6,true,'igualdad','9m','habilidad'),
  (m2,20,'home','exclusion',null,null,'Palma',9,null,null,6,6,true,'igualdad',null,null),
  (m2,21,'away','goal','center',1,'Morales',5,'Blanco',1,6,7,true,'superioridad','9m','salto'),
  (m2,22,'home','miss','right_wing',2,'Álvarez',6,'García',1,6,7,true,'inferioridad','6m','finta'),
  (m2,23,'away','miss','right_back',5,'Rodríguez',11,'Blanco',1,6,7,true,'igualdad','9m','salto'),
  (m2,24,'home','goal','left_back',0,'Coria',4,'García',1,7,7,true,'igualdad','9m','salto'),
  (m2,25,'away','goal','left_wing',6,'Martínez',7,'Blanco',1,7,8,true,'igualdad','6m','finta'),
  (m2,26,'home','goal','pivot',3,'Palma',9,'García',1,8,8,true,'igualdad','6m','penetracion'),
  (m2,27,'away','saved','center',4,'Pérez',9,'Blanco',1,8,8,true,'igualdad','penal','otro'),
  (m2,28,'home','goal','right_back',5,'Juárez',11,'García',1,9,8,true,'igualdad','9m','salto'),
  (m2,29,'away','goal','pivot',7,'Vera',9,'Blanco',1,9,9,true,'igualdad','6m','penetracion'),
  (m2,30,null,'half_time',null,null,null,null,null,null,11,10,true,null,null,null),

  -- 2da parte — partido muy parejo, GEI define al final
  (m2,31,'away','goal','center',4,'López',5,'Blanco',1,11,11,true,'igualdad','9m','salto'),
  (m2,32,'home','goal','center',1,'Coria',4,'García',1,12,11,true,'igualdad','9m','habilidad'),
  (m2,33,'away','goal','left_back',3,'Martínez',7,'Blanco',1,12,12,true,'igualdad','9m','finta'),
  (m2,34,'home','miss','pivot',7,'Palma',9,'García',1,12,12,true,'igualdad','6m','penetracion'),
  (m2,35,'away','goal','pivot',3,'Vera',9,'Blanco',1,12,13,true,'igualdad','6m','penetracion'),
  (m2,36,'home','exclusion',null,null,'Leiva',13,null,null,12,13,true,'igualdad',null,null),
  (m2,37,'away','goal','center',4,'Pérez',9,'Blanco',1,12,14,true,'superioridad','9m','salto'),
  (m2,38,'home','goal','right_back',2,'Juárez',11,'García',1,13,14,true,'inferioridad','9m','salto'),
  (m2,39,'away','saved','left_wing',0,'Ríos',4,'Blanco',1,13,14,true,'igualdad','6m','finta'),
  (m2,40,'home','goal','center',4,'Coria',4,'García',1,14,14,true,'igualdad','9m','salto'),
  (m2,41,'away','goal','right_wing',2,'Ruiz',6,'Blanco',1,14,15,true,'igualdad','6m','finta'),
  (m2,42,'home','saved','left_back',3,'Leiva',13,'García',1,14,15,true,'igualdad','9m','habilidad'),
  (m2,43,'home','timeout',null,null,null,null,null,null,14,15,true,null,null,null),
  (m2,44,'away','goal','center',1,'Morales',5,'Blanco',1,14,16,true,'igualdad','9m','habilidad'),
  (m2,45,'home','goal','pivot',7,'Palma',9,'García',1,15,16,true,'igualdad','6m','penetracion'),
  (m2,46,'away','goal','left_back',1,'López',5,'Blanco',1,15,17,true,'igualdad','9m','salto'),
  (m2,47,'home','miss','center',4,'Medina',7,'García',1,15,17,true,'igualdad','9m','salto'),
  (m2,48,'away','goal','pivot',7,'Vera',9,'Blanco',1,15,18,true,'igualdad','6m','penetracion'),
  (m2,49,'home','exclusion',null,null,'Coria',4,null,null,15,18,true,'igualdad',null,null),
  (m2,50,'away','goal','center',4,'Martínez',7,'Blanco',1,15,19,true,'superioridad','9m','finta'),
  (m2,51,'home','goal','right_back',5,'Juárez',11,'García',1,16,19,true,'inferioridad','9m','salto'),
  (m2,52,'away','saved','left_back',3,'Pérez',9,'Blanco',1,16,19,true,'igualdad','9m','salto'),
  (m2,53,'home','goal','pivot',3,'Palma',9,'García',1,17,19,true,'igualdad','6m','penetracion'),
  (m2,54,'away','goal','center',4,'López',5,'Blanco',1,17,20,true,'igualdad','9m','salto'),
  (m2,55,'home','miss','left_wing',6,'Álvarez',6,'García',1,17,20,true,'igualdad','6m','finta'),
  (m2,56,'away','goal','pivot',7,'Vera',9,'Blanco',1,17,21,true,'igualdad','6m','penetracion'),
  (m2,57,'home','goal','center',4,'Coria',4,'García',1,18,21,true,'igualdad','9m','habilidad'),
  (m2,58,'away','saved','right_back',2,'Rodríguez',11,'Blanco',1,18,21,true,'igualdad','9m','salto'),
  (m2,59,'home','red_card',null,null,'Leiva',13,null,null,18,21,true,'igualdad',null,null),
  (m2,60,'away','goal','center',4,'Morales',5,'Blanco',1,22,24,true,'superioridad','9m','salto');

end $$;
