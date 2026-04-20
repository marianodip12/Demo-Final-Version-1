-- ═══════════════════════════════════════════════════
--  HANDBALL PRO v8 — Demo realista completo
--  Pegá en SQL Editor → Run
-- ═══════════════════════════════════════════════════

do $$
declare
  gei_id uuid; ber_id uuid; tig_id uuid;
  m1 uuid; m2 uuid; m3 uuid;
begin

  -- Equipo GEI
  select id into gei_id from teams where name = 'GEI' limit 1;
  if gei_id is null then
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
  end if;

  insert into rival_teams (name, color) values ('Bernal', '#3b82f6') on conflict (name) do nothing;
  insert into rival_teams (name, color) values ('Tigres FC', '#f59e0b') on conflict (name) do nothing;
  select id into ber_id from rival_teams where name = 'Bernal';
  select id into tig_id from rival_teams where name = 'Tigres FC';

-- ════════════════════════════════════════════════════
--  PARTIDO 1: GEI 18 – 15 Bernal | Liga Jornada 1
--  Tiros GEI: 28 (18G 5A 5E) | Bernal: 24 (15G 4A 5E)
-- ════════════════════════════════════════════════════
  insert into matches (home_team_id, home_name, away_name, away_rival_id,
    home_color, away_color, home_score, away_score, match_date,
    competition, round, status)
  values (gei_id,'GEI','Bernal',ber_id,'#ef4444','#3b82f6',
    18,15,'01/03','Liga','Jornada 1','closed') returning id into m1;

  insert into events (match_id,minute,team,type,zone,quadrant,
    shooter_name,shooter_number,goalkeeper_name,goalkeeper_number,
    h_score,a_score,completed,situation,distance) values

  -- MIN 1-15
  (m1,2,'home','goal','center',4,'López',5,'Sosa',2,1,0,true,'igualdad','9m'),
  (m1,3,'away','miss','left_back',0,'Ibáñez',7,'García',1,1,0,true,'igualdad','9m'),
  (m1,5,'away','goal','center',4,'Herrera',3,'García',1,1,1,true,'igualdad','9m'),
  (m1,6,'home','saved','right_back',2,'Ríos',4,'Sosa',2,1,1,true,'igualdad','9m'),
  (m1,7,'home','goal','pivot',3,'Vera',9,'Sosa',2,2,1,true,'igualdad','6m'),
  (m1,8,'away','miss','right_wing',6,'Vega',14,'García',1,2,1,true,'igualdad','6m'),
  (m1,9,'home','saved','left_back',1,'Martínez',7,'Sosa',2,2,1,true,'igualdad','9m'),
  (m1,10,'away','exclusion',null,null,null,null,null,null,2,1,true,'igualdad',null),
  (m1,11,'home','goal','center',1,'Morales',5,'Sosa',2,3,1,true,'superioridad','9m'),
  (m1,12,'home','miss','left_back',3,'Ruiz',6,'Sosa',2,3,1,true,'superioridad','9m'),
  (m1,13,'away','goal','center',4,'Castro',8,'García',1,3,2,true,'inferioridad','9m'),
  (m1,14,'home','goal','right_wing',2,'Torres',13,'Sosa',2,4,2,true,'igualdad','6m'),
  (m1,15,'away','saved','left_back',0,'Herrera',3,'García',1,4,2,true,'igualdad','9m'),

  -- MIN 16-30
  (m1,16,'home','goal','pivot',7,'Pérez',9,'Sosa',2,5,2,true,'igualdad','6m'),
  (m1,17,'away','miss','center',4,'Meza',11,'García',1,5,2,true,'igualdad','9m'),
  (m1,18,'away','goal','left_wing',6,'Ibáñez',7,'García',1,5,3,true,'igualdad','6m'),
  (m1,19,'home','timeout',null,null,null,null,null,null,5,3,true,null,null),
  (m1,20,'home','goal','center',4,'López',5,'Sosa',2,6,3,true,'igualdad','9m'),
  (m1,21,'away','saved','right_back',5,'Castro',8,'García',1,6,3,true,'igualdad','9m'),
  (m1,22,'home','miss','left_back',0,'Rodríguez',11,'Sosa',2,6,3,true,'igualdad','9m'),
  (m1,23,'away','goal','center',1,'Herrera',3,'García',1,6,4,true,'igualdad','9m'),
  (m1,24,'home','goal','pivot',3,'Vera',9,'Sosa',2,7,4,true,'igualdad','6m'),
  (m1,25,'away','exclusion',null,null,null,null,null,null,7,4,true,'igualdad',null),
  (m1,26,'home','goal','center',4,'Morales',5,'Sosa',2,8,4,true,'superioridad','9m'),
  (m1,27,'home','saved','right_back',2,'Ríos',4,'Sosa',2,8,4,true,'superioridad','9m'),
  (m1,28,'away','goal','left_back',3,'Meza',11,'García',1,8,5,true,'inferioridad','9m'),
  (m1,29,'home','goal','left_back',1,'Martínez',7,'Sosa',2,9,5,true,'igualdad','9m'),
  (m1,30,null,'half_time',null,null,null,null,null,null,9,6,true,null,null),

  -- MIN 31-60
  (m1,31,'away','goal','center',4,'Castro',8,'García',1,9,7,true,'igualdad','9m'),
  (m1,32,'home','miss','pivot',7,'Pérez',9,'Sosa',2,9,7,true,'igualdad','6m'),
  (m1,33,'home','goal','center',1,'López',5,'Sosa',2,10,7,true,'igualdad','9m'),
  (m1,34,'away','miss','left_back',3,'Ibáñez',7,'García',1,10,7,true,'igualdad','9m'),
  (m1,35,'home','goal','pivot',3,'Vera',9,'Sosa',2,11,7,true,'igualdad','6m'),
  (m1,36,'away','saved','center',4,'Herrera',3,'García',1,11,7,true,'igualdad','9m'),
  (m1,37,'away','goal','right_wing',8,'Vega',14,'García',1,11,8,true,'igualdad','6m'),
  (m1,38,'home','exclusion',null,null,null,null,null,null,11,8,true,'igualdad',null),
  (m1,39,'away','miss','center',4,'Castro',8,'García',1,11,8,true,'superioridad','9m'),
  (m1,40,'home','goal','left_back',0,'Ruiz',6,'Sosa',2,12,8,true,'inferioridad','9m'),
  (m1,41,'away','red_card',null,null,null,null,null,null,12,8,true,'igualdad',null),
  (m1,42,'home','goal','center',4,'Morales',5,'Sosa',2,13,8,true,'superioridad','9m'),
  (m1,43,'away','goal','pivot',3,'Acosta',10,'García',1,13,9,true,'inferioridad','6m'),
  (m1,44,'home','goal','right_back',2,'Ríos',4,'Sosa',2,14,9,true,'igualdad','9m'),
  (m1,45,'away','timeout',null,null,null,null,null,null,14,9,true,null,null),
  (m1,46,'away','goal','center',1,'Herrera',3,'García',1,14,10,true,'igualdad','9m'),
  (m1,47,'home','saved','left_back',3,'Martínez',7,'Sosa',2,14,10,true,'igualdad','9m'),
  (m1,48,'home','goal','pivot',7,'Pérez',9,'Sosa',2,15,10,true,'igualdad','6m'),
  (m1,50,'away','miss','right_back',5,'Meza',11,'García',1,15,10,true,'igualdad','9m'),
  (m1,51,'home','goal','center',4,'López',5,'Sosa',2,16,10,true,'igualdad','9m'),
  (m1,52,'away','goal','left_wing',6,'Ibáñez',7,'García',1,16,11,true,'igualdad','6m'),
  (m1,53,'home','miss','right_wing',2,'Torres',13,'Sosa',2,16,11,true,'igualdad','6m'),
  (m1,54,'away','exclusion',null,null,null,null,null,null,16,11,true,'igualdad',null),
  (m1,55,'home','goal','pivot',3,'Vera',9,'Sosa',2,17,11,true,'superioridad','6m'),
  (m1,56,'away','saved','center',4,'Castro',8,'García',1,17,11,true,'inferioridad','9m'),
  (m1,57,'away','goal','left_back',0,'Herrera',3,'García',1,17,12,true,'igualdad','9m'),
  (m1,58,'home','miss','center',1,'Morales',5,'Sosa',2,17,12,true,'igualdad','9m'),
  (m1,59,'home','goal','left_back',3,'Martínez',7,'Sosa',2,18,12,true,'igualdad','9m'),
  (m1,60,'away','goal','pivot',7,'Acosta',10,'García',1,18,15,true,'igualdad','6m');

-- ════════════════════════════════════════════════════
--  PARTIDO 2: Bernal 14 – 22 GEI | Liga Jornada 3
--  GEI gana visitante, gran 2da parte
-- ════════════════════════════════════════════════════
  insert into matches (home_team_id, home_name, away_name, away_rival_id,
    home_color, away_color, home_score, away_score, match_date,
    competition, round, status)
  values (gei_id,'Bernal','GEI',ber_id,'#3b82f6','#ef4444',
    14,22,'15/03','Liga','Jornada 3','closed') returning id into m2;

  insert into events (match_id,minute,team,type,zone,quadrant,
    shooter_name,shooter_number,goalkeeper_name,goalkeeper_number,
    h_score,a_score,completed,situation,distance) values

  (m2,2,'home','goal','center',4,'Herrera',3,'García',1,1,0,true,'igualdad','9m'),
  (m2,3,'away','miss','left_back',3,'Martínez',7,'Sosa',2,1,0,true,'igualdad','9m'),
  (m2,4,'away','goal','pivot',7,'Vera',9,'Sosa',2,1,1,true,'igualdad','6m'),
  (m2,5,'home','miss','right_back',5,'Castro',8,'García',1,1,1,true,'igualdad','9m'),
  (m2,6,'away','saved','center',4,'López',5,'Sosa',2,1,1,true,'igualdad','9m'),
  (m2,7,'home','goal','left_wing',6,'Ibáñez',7,'García',1,2,1,true,'igualdad','6m'),
  (m2,8,'away','goal','right_back',2,'Ríos',4,'Sosa',2,2,2,true,'igualdad','9m'),
  (m2,9,'home','exclusion',null,null,null,null,null,null,2,2,true,'igualdad',null),
  (m2,10,'away','goal','center',1,'Morales',5,'Sosa',2,2,3,true,'superioridad','9m'),
  (m2,11,'home','saved','center',4,'Meza',11,'García',1,2,3,true,'inferioridad','9m'),
  (m2,12,'home','goal','pivot',3,'Acosta',10,'García',1,3,3,true,'igualdad','6m'),
  (m2,13,'away','miss','left_back',0,'Ruiz',6,'Sosa',2,3,3,true,'igualdad','9m'),
  (m2,14,'home','goal','center',4,'Herrera',3,'García',1,4,3,true,'igualdad','9m'),
  (m2,15,'away','goal','pivot',3,'Pérez',9,'Sosa',2,4,4,true,'igualdad','6m'),
  (m2,16,'home','miss','left_back',3,'Ibáñez',7,'García',1,4,4,true,'igualdad','9m'),
  (m2,17,'away','saved','right_back',2,'Rodríguez',11,'Sosa',2,4,4,true,'igualdad','9m'),
  (m2,18,'home','goal','center',4,'Castro',8,'García',1,5,4,true,'igualdad','9m'),
  (m2,19,'away','exclusion',null,null,null,null,null,null,5,4,true,'igualdad',null),
  (m2,20,'home','miss','right_wing',8,'Vega',14,'García',1,5,4,true,'inferioridad','6m'),
  (m2,21,'away','goal','center',4,'López',5,'Sosa',2,5,5,true,'superioridad','9m'),
  (m2,22,'home','yellow_card',null,null,null,null,null,null,5,5,true,'igualdad',null),
  (m2,24,'away','goal','left_back',1,'Martínez',7,'Sosa',2,5,6,true,'igualdad','9m'),
  (m2,25,'home','saved','pivot',7,'Acosta',10,'García',1,5,6,true,'igualdad','6m'),
  (m2,26,'home','goal','center',4,'Herrera',3,'García',1,6,6,true,'igualdad','9m'),
  (m2,27,'away','miss','right_wing',2,'Torres',13,'Sosa',2,6,6,true,'igualdad','6m'),
  (m2,28,'home','goal','left_back',3,'Castro',8,'García',1,7,6,true,'igualdad','9m'),
  (m2,29,'away','goal','pivot',7,'Vera',9,'Sosa',2,7,7,true,'igualdad','6m'),
  (m2,30,null,'half_time',null,null,null,null,null,null,7,8,true,null,null),

  -- 2da parte GEI domina
  (m2,31,'away','goal','center',4,'Morales',5,'Sosa',2,7,9,true,'igualdad','9m'),
  (m2,32,'home','miss','left_back',0,'Ibáñez',7,'García',1,7,9,true,'igualdad','9m'),
  (m2,33,'away','goal','pivot',3,'Pérez',9,'Sosa',2,7,10,true,'igualdad','6m'),
  (m2,34,'home','saved','center',4,'Castro',8,'García',1,7,10,true,'igualdad','9m'),
  (m2,35,'away','goal','left_back',1,'Ruiz',6,'Sosa',2,7,11,true,'igualdad','9m'),
  (m2,36,'home','exclusion',null,null,null,null,null,null,7,11,true,'igualdad',null),
  (m2,37,'away','goal','center',4,'López',5,'Sosa',2,7,12,true,'superioridad','9m'),
  (m2,38,'home','miss','right_back',5,'Meza',11,'García',1,7,12,true,'inferioridad','9m'),
  (m2,39,'home','goal','pivot',7,'Acosta',10,'García',1,8,12,true,'igualdad','6m'),
  (m2,40,'away','goal','right_wing',2,'Torres',13,'Sosa',2,8,13,true,'igualdad','6m'),
  (m2,41,'home','miss','center',1,'Herrera',3,'García',1,8,13,true,'igualdad','9m'),
  (m2,42,'away','saved','left_back',3,'Martínez',7,'Sosa',2,8,13,true,'igualdad','9m'),
  (m2,43,'away','goal','pivot',7,'Vera',9,'Sosa',2,8,14,true,'igualdad','6m'),
  (m2,44,'home','timeout',null,null,null,null,null,null,8,14,true,null,null),
  (m2,45,'home','goal','center',4,'Castro',8,'García',1,9,14,true,'igualdad','9m'),
  (m2,46,'away','miss','center',4,'Morales',5,'Sosa',2,9,14,true,'igualdad','9m'),
  (m2,47,'away','goal','left_back',0,'Ruiz',6,'Sosa',2,9,15,true,'igualdad','9m'),
  (m2,48,'home','saved','right_wing',8,'Vega',14,'García',1,9,15,true,'igualdad','6m'),
  (m2,49,'away','goal','pivot',3,'Pérez',9,'Sosa',2,9,16,true,'igualdad','6m'),
  (m2,50,'home','red_card',null,null,null,null,null,null,9,16,true,'igualdad',null),
  (m2,51,'away','goal','center',1,'López',5,'Sosa',2,9,17,true,'superioridad','9m'),
  (m2,52,'home','miss','left_back',3,'Ibáñez',7,'García',1,9,17,true,'inferioridad','9m'),
  (m2,53,'away','goal','right_back',2,'Ríos',4,'Sosa',2,9,18,true,'igualdad','9m'),
  (m2,54,'home','goal','center',4,'Herrera',3,'García',1,10,18,true,'igualdad','9m'),
  (m2,55,'away','goal','pivot',7,'Vera',9,'Sosa',2,10,19,true,'igualdad','6m'),
  (m2,56,'home','miss','center',4,'Castro',8,'García',1,10,19,true,'igualdad','9m'),
  (m2,57,'away','goal','left_back',1,'Martínez',7,'Sosa',2,10,20,true,'igualdad','9m'),
  (m2,58,'home','goal','pivot',3,'Acosta',10,'García',1,11,20,true,'igualdad','6m'),
  (m2,59,'away','goal','center',4,'Morales',5,'Sosa',2,11,21,true,'igualdad','9m'),
  (m2,60,'away','goal','right_back',5,'Ríos',4,'Sosa',2,14,22,true,'igualdad','9m');

-- ════════════════════════════════════════════════════
--  PARTIDO 3: GEI 27 – 21 Tigres FC | Copa Cuartos
--  Partido parejo con remontada en 2da parte
-- ════════════════════════════════════════════════════
  insert into matches (home_team_id, home_name, away_name, away_rival_id,
    home_color, away_color, home_score, away_score, match_date,
    competition, round, status)
  values (gei_id,'GEI','Tigres FC',tig_id,'#ef4444','#f59e0b',
    27,21,'22/03','Copa','Cuartos de Final','closed') returning id into m3;

  insert into events (match_id,minute,team,type,zone,quadrant,
    shooter_name,shooter_number,goalkeeper_name,goalkeeper_number,
    h_score,a_score,completed,situation,distance) values

  (m3,1,'away','goal','center',4,'Silva',7,'García',1,0,1,true,'igualdad','9m'),
  (m3,2,'home','miss','left_back',3,'Martínez',7,'Ramos',1,0,1,true,'igualdad','9m'),
  (m3,3,'home','goal','pivot',7,'Vera',9,'Ramos',1,1,1,true,'igualdad','6m'),
  (m3,4,'away','miss','right_back',5,'Díaz',9,'García',1,1,1,true,'igualdad','9m'),
  (m3,5,'away','goal','center',1,'Gómez',11,'García',1,1,2,true,'igualdad','9m'),
  (m3,6,'home','saved','center',4,'López',5,'Ramos',1,1,2,true,'igualdad','9m'),
  (m3,7,'away','goal','left_wing',6,'Núñez',3,'García',1,1,3,true,'igualdad','6m'),
  (m3,8,'home','exclusion',null,null,null,null,null,null,1,3,true,'igualdad',null),
  (m3,9,'away','miss','center',4,'Silva',7,'García',1,1,3,true,'superioridad','9m'),
  (m3,10,'home','goal','left_back',1,'Morales',5,'Ramos',1,2,3,true,'inferioridad','9m'),
  (m3,11,'away','saved','right_back',2,'Díaz',9,'García',1,2,3,true,'igualdad','9m'),
  (m3,12,'home','goal','center',4,'López',5,'Ramos',1,3,3,true,'igualdad','9m'),
  (m3,13,'away','exclusion',null,null,null,null,null,null,3,3,true,'igualdad',null),
  (m3,14,'home','goal','pivot',3,'Pérez',9,'Ramos',1,4,3,true,'superioridad','6m'),
  (m3,15,'away','goal','center',4,'Gómez',11,'García',1,4,4,true,'inferioridad','9m'),
  (m3,16,'home','miss','right_wing',2,'Torres',13,'Ramos',1,4,4,true,'igualdad','6m'),
  (m3,17,'away','goal','left_back',3,'Silva',7,'García',1,4,5,true,'igualdad','9m'),
  (m3,18,'home','timeout',null,null,null,null,null,null,4,5,true,null,null),
  (m3,19,'home','goal','center',4,'Martínez',7,'Ramos',1,5,5,true,'igualdad','9m'),
  (m3,20,'away','miss','pivot',7,'Díaz',9,'García',1,5,5,true,'igualdad','6m'),
  (m3,21,'home','saved','left_back',0,'Ríos',4,'Ramos',1,5,5,true,'igualdad','9m'),
  (m3,22,'away','goal','center',1,'Núñez',3,'García',1,5,6,true,'igualdad','9m'),
  (m3,23,'home','goal','pivot',7,'Vera',9,'Ramos',1,6,6,true,'igualdad','6m'),
  (m3,24,'away','saved','right_back',5,'Gómez',11,'García',1,6,6,true,'igualdad','9m'),
  (m3,25,'home','goal','center',4,'Ruiz',6,'Ramos',1,7,6,true,'igualdad','9m'),
  (m3,26,'away','miss','left_wing',6,'Silva',7,'García',1,7,6,true,'igualdad','6m'),
  (m3,27,'away','goal','center',4,'Díaz',9,'García',1,7,7,true,'igualdad','9m'),
  (m3,28,'home','miss','left_back',3,'Morales',5,'Ramos',1,7,7,true,'igualdad','9m'),
  (m3,29,'home','goal','pivot',3,'Pérez',9,'Ramos',1,8,7,true,'igualdad','6m'),
  (m3,30,null,'half_time',null,null,null,null,null,null,11,12,true,null,null),

  -- 2da parte GEI remonta
  (m3,31,'away','goal','center',4,'Gómez',11,'García',1,11,13,true,'igualdad','9m'),
  (m3,32,'home','goal','left_back',1,'Martínez',7,'Ramos',1,12,13,true,'igualdad','9m'),
  (m3,33,'home','goal','pivot',7,'Vera',9,'Ramos',1,13,13,true,'igualdad','6m'),
  (m3,34,'away','miss','right_back',2,'Silva',7,'García',1,13,13,true,'igualdad','9m'),
  (m3,35,'home','goal','center',4,'López',5,'Ramos',1,14,13,true,'igualdad','9m'),
  (m3,36,'away','exclusion',null,null,null,null,null,null,14,13,true,'igualdad',null),
  (m3,37,'home','goal','center',1,'Morales',5,'Ramos',1,15,13,true,'superioridad','9m'),
  (m3,38,'home','saved','right_wing',2,'Torres',13,'Ramos',1,15,13,true,'superioridad','6m'),
  (m3,39,'away','goal','center',4,'Díaz',9,'García',1,15,14,true,'inferioridad','9m'),
  (m3,40,'home','goal','pivot',3,'Pérez',9,'Ramos',1,16,14,true,'igualdad','6m'),
  (m3,41,'away','miss','left_back',3,'Núñez',3,'García',1,16,14,true,'igualdad','9m'),
  (m3,42,'home','goal','left_back',0,'Ruiz',6,'Ramos',1,17,14,true,'igualdad','9m'),
  (m3,43,'away','saved','pivot',7,'Díaz',9,'García',1,17,14,true,'igualdad','6m'),
  (m3,44,'away','goal','center',1,'Gómez',11,'García',1,17,15,true,'igualdad','9m'),
  (m3,45,'home','timeout',null,null,null,null,null,null,17,15,true,null,null),
  (m3,46,'home','goal','center',4,'Martínez',7,'Ramos',1,18,15,true,'igualdad','9m'),
  (m3,47,'away','miss','right_back',5,'Silva',7,'García',1,18,15,true,'igualdad','9m'),
  (m3,48,'home','goal','pivot',7,'Vera',9,'Ramos',1,19,15,true,'igualdad','6m'),
  (m3,49,'away','red_card',null,null,null,null,null,null,19,15,true,'igualdad',null),
  (m3,50,'home','goal','center',4,'López',5,'Ramos',1,20,15,true,'superioridad','9m'),
  (m3,51,'away','goal','left_wing',6,'Núñez',3,'García',1,20,16,true,'inferioridad','6m'),
  (m3,52,'home','miss','left_back',3,'Morales',5,'Ramos',1,20,16,true,'igualdad','9m'),
  (m3,53,'away','goal','center',4,'Díaz',9,'García',1,20,17,true,'igualdad','9m'),
  (m3,54,'home','goal','right_back',2,'Ríos',4,'Ramos',1,21,17,true,'igualdad','9m'),
  (m3,55,'away','miss','pivot',7,'Gómez',11,'García',1,21,17,true,'igualdad','6m'),
  (m3,56,'home','goal','center',1,'Martínez',7,'Ramos',1,22,17,true,'igualdad','9m'),
  (m3,57,'away','goal','left_back',0,'Silva',7,'García',1,22,18,true,'igualdad','9m'),
  (m3,58,'home','goal','pivot',3,'Pérez',9,'Ramos',1,23,18,true,'igualdad','6m'),
  (m3,59,'away','miss','center',4,'Díaz',9,'García',1,23,18,true,'igualdad','9m'),
  (m3,60,'home','goal','center',4,'Vera',9,'Ramos',1,27,21,true,'igualdad','6m');

end $$;
