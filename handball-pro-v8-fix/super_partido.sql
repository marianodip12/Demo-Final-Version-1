-- ═══════════════════════════════════════════════════
--  HANDBALL PRO v8 — SUPER PARTIDO COMPLETO
--  GEI vs Atlético Norte | Liga | Semifinal
--  Pegá en SQL Editor → Run
-- ═══════════════════════════════════════════════════

do $$
declare
  gei_id  uuid;
  nor_id  uuid;
  m_id    uuid;
begin

  select id into gei_id from teams where name = 'GEI' limit 1;

  insert into rival_teams (name, color) values ('Atlético Norte', '#8b5cf6')
    on conflict (name) do nothing;
  select id into nor_id from rival_teams where name = 'Atlético Norte';

  -- Jugadores rivales
  insert into rival_players (rival_team_id, name, number, position) values
    (nor_id, 'Navarro',  1,  'Arquero'),
    (nor_id, 'Romero',   4,  'Lateral Der.'),
    (nor_id, 'Suárez',   7,  'Extremo Izq.'),
    (nor_id, 'Benítez',  9,  'Armador'),
    (nor_id, 'Quiroga',  11, 'Pivote'),
    (nor_id, 'Ferreyra', 13, 'Lateral Izq.'),
    (nor_id, 'Núñez',    3,  'Extremo Der.')
  on conflict do nothing;

  -- Partido: GEI 23 – 19 Atlético Norte
  insert into matches (
    home_team_id, home_name, away_name, away_rival_id,
    home_color, away_color, home_score, away_score,
    match_date, competition, round, status
  ) values (
    gei_id, 'GEI', 'Atlético Norte', nor_id,
    '#ef4444', '#8b5cf6', 23, 19,
    '22/03', 'Liga', 'Semifinal', 'closed'
  ) returning id into m_id;

  -- ════════════════════════════
  --  1ª PARTE — MIN 1 a 30
  -- ════════════════════════════
  insert into events (match_id,minute,team,type,zone,quadrant,
    shooter_name,shooter_number,goalkeeper_name,goalkeeper_number,
    h_score,a_score,completed,situation,distance,throw_type) values

  -- MIN 1: GEI ataca, GOL de López desde 9m salto
  (m_id,1,'home','goal','center',4,'López',5,'Navarro',1,1,0,true,'igualdad','9m','salto'),

  -- MIN 2: Norte responde, atajada de García
  (m_id,2,'away','saved','left_back',1,'Romero',4,'García',1,1,0,true,'igualdad','9m','habilidad'),

  -- MIN 3: Norte gol de Benítez penetración
  (m_id,3,'away','goal','center',3,'Benítez',9,'García',1,1,1,true,'igualdad','6m','penetracion'),

  -- MIN 4: GEI Martínez finta gol
  (m_id,4,'home','goal','left_wing',0,'Martínez',7,'Navarro',1,2,1,true,'igualdad','6m','finta'),

  -- MIN 5: Norte Suárez errado extremo
  (m_id,5,'away','miss','right_wing',8,'Suárez',7,'García',1,2,1,true,'igualdad','6m','salto'),

  -- MIN 6: GEI Vera pivote habilidad atajada
  (m_id,6,'home','saved','pivot',4,'Vera',9,'Navarro',1,2,1,true,'igualdad','6m','habilidad'),

  -- MIN 7: GEI Pérez 9m salto GOL
  (m_id,7,'home','goal','left_back',1,'Pérez',9,'Navarro',1,3,1,true,'igualdad','9m','salto'),

  -- MIN 8: Norte Quiroga pivote GOL
  (m_id,8,'away','goal','pivot',7,'Quiroga',11,'García',1,3,2,true,'igualdad','6m','penetracion'),

  -- MIN 9: GEI EXCLUSIÓN Torres
  (m_id,9,'home','exclusion',null,null,'Torres',13,null,null,3,2,true,'igualdad',null,null),

  -- MIN 10: Norte superioridad Ferreyra GOL 9m
  (m_id,10,'away','goal','left_back',3,'Ferreyra',13,'García',1,3,3,true,'superioridad','9m','salto'),

  -- MIN 11: Norte superioridad Benítez errado
  (m_id,11,'away','miss','center',1,'Benítez',9,'García',1,3,3,true,'superioridad','9m','habilidad'),

  -- MIN 12: GEI inferioridad Ruiz contraataque GOL
  (m_id,12,'home','goal','right_wing',2,'Ruiz',6,'Navarro',1,4,3,true,'inferioridad','6m','penetracion'),

  -- MIN 13: Norte TIEMPO MUERTO
  (m_id,13,'away','timeout',null,null,null,null,null,null,4,3,true,null,null,null),

  -- MIN 14: Norte Romero GOL 9m habilidad
  (m_id,14,'away','goal','right_back',5,'Romero',4,'García',1,4,4,true,'igualdad','9m','habilidad'),

  -- MIN 15: GEI Morales 9m ATAJADA Navarro
  (m_id,15,'home','saved','center',4,'Morales',5,'Navarro',1,4,4,true,'igualdad','9m','salto'),

  -- MIN 16: GEI Rodríguez lateral 9m GOL
  (m_id,16,'home','goal','right_back',2,'Rodríguez',11,'Navarro',1,5,4,true,'igualdad','9m','salto'),

  -- MIN 17: Norte Núñez extremo finta GOL
  (m_id,17,'away','goal','left_wing',6,'Núñez',3,'García',1,5,5,true,'igualdad','6m','finta'),

  -- MIN 18: GEI Ríos lateral finta ATAJADA
  (m_id,18,'home','saved','left_back',0,'Ríos',4,'Navarro',1,5,5,true,'igualdad','9m','finta'),

  -- MIN 19: GEI TIEMPO MUERTO
  (m_id,19,'home','timeout',null,null,null,null,null,null,5,5,true,null,null,null),

  -- MIN 20: GEI López 9m salto GOL
  (m_id,20,'home','goal','center',1,'López',5,'Navarro',1,6,5,true,'igualdad','9m','salto'),

  -- MIN 21: Norte Benítez penetración ATAJADA García GRAN ATAJADA
  (m_id,21,'away','saved','pivot',4,'Benítez',9,'García',1,6,5,true,'igualdad','6m','penetracion'),

  -- MIN 22: Norte TARJETA AMARILLA Quiroga
  (m_id,22,'away','yellow_card',null,null,'Quiroga',11,null,null,6,5,true,'igualdad',null,null),

  -- MIN 23: GEI Vera pivote penetración GOL
  (m_id,23,'home','goal','pivot',3,'Vera',9,'Navarro',1,7,5,true,'igualdad','6m','penetracion'),

  -- MIN 24: Norte Ferreyra 9m errado
  (m_id,24,'away','miss','left_back',0,'Ferreyra',13,'García',1,7,5,true,'igualdad','9m','salto'),

  -- MIN 25: GEI Martínez extremo finta GOL espectacular
  (m_id,25,'home','goal','left_wing',6,'Martínez',7,'Navarro',1,8,5,true,'superioridad','6m','finta'),

  -- MIN 26: Norte Romero PENAL 7m GOL
  (m_id,26,'away','goal','center',4,'Romero',4,'García',1,8,6,true,'igualdad','penal','otro'),

  -- MIN 27: GEI Pérez 9m salto ATAJADA Navarro
  (m_id,27,'home','saved','center',1,'Pérez',9,'Navarro',1,8,6,true,'igualdad','9m','salto'),

  -- MIN 28: Norte EXCLUSIÓN Suárez 2 min
  (m_id,28,'away','exclusion',null,null,'Suárez',7,null,null,8,6,true,'igualdad',null,null),

  -- MIN 29: GEI superioridad Morales GOL habilidad
  (m_id,29,'home','goal','left_back',2,'Morales',5,'Navarro',1,9,6,true,'superioridad','9m','habilidad'),

  -- MIN 30: DESCANSO
  (m_id,30,null,'half_time',null,null,null,null,null,null,11,9,true,null,null,null),

  -- ════════════════════════════
  --  2ª PARTE — MIN 31 a 60
  -- ════════════════════════════

  -- MIN 31: Norte Benítez abre 2da parte GOL 9m
  (m_id,31,'away','goal','center',4,'Benítez',9,'García',1,11,10,true,'igualdad','9m','salto'),

  -- MIN 32: GEI Torres ROJO — expulsado
  (m_id,32,'home','red_card',null,null,'Torres',13,null,null,11,10,true,'igualdad',null,null),

  -- MIN 33: Norte superioridad Quiroga pivote GOL
  (m_id,33,'away','goal','pivot',3,'Quiroga',11,'García',1,11,11,true,'superioridad','6m','penetracion'),

  -- MIN 34: GEI Ruiz contraataque GOL finta
  (m_id,34,'home','goal','right_wing',2,'Ruiz',6,'Navarro',1,12,11,true,'inferioridad','6m','finta'),

  -- MIN 35: Norte Ferreyra 9m ATAJADA García espectacular
  (m_id,35,'away','saved','right_back',5,'Ferreyra',13,'García',1,12,11,true,'igualdad','9m','salto'),

  -- MIN 36: GEI Vera habilidad GOL
  (m_id,36,'home','goal','pivot',7,'Vera',9,'Navarro',1,13,11,true,'igualdad','6m','habilidad'),

  -- MIN 37: Norte Núñez finta errado
  (m_id,37,'away','miss','left_wing',6,'Núñez',3,'García',1,13,11,true,'igualdad','6m','finta'),

  -- MIN 38: GEI Ríos 9m salto GOL
  (m_id,38,'home','goal','right_back',2,'Ríos',4,'Navarro',1,14,11,true,'igualdad','9m','salto'),

  -- MIN 39: Norte EXCLUSIÓN Romero 2 min
  (m_id,39,'away','exclusion',null,null,'Romero',4,null,null,14,11,true,'igualdad',null,null),

  -- MIN 40: GEI López superioridad GOL habilidad
  (m_id,40,'home','goal','center',1,'López',5,'Navarro',1,15,11,true,'superioridad','9m','habilidad'),

  -- MIN 41: GEI Martínez extremo GOL finta brillante
  (m_id,41,'home','goal','left_wing',0,'Martínez',7,'Navarro',1,16,11,true,'superioridad','6m','finta'),

  -- MIN 42: Norte Suárez errado ángulo difícil
  (m_id,42,'away','miss','right_wing',2,'Suárez',7,'García',1,16,11,true,'inferioridad','6m','salto'),

  -- MIN 43: Norte Benítez 9m GOL descuento
  (m_id,43,'away','goal','center',4,'Benítez',9,'García',1,16,12,true,'igualdad','9m','salto'),

  -- MIN 44: GEI Pérez PENAL GOL
  (m_id,44,'home','goal','center',4,'Pérez',9,'Navarro',1,17,12,true,'igualdad','penal','otro'),

  -- MIN 45: Norte Quiroga pivote ATAJADA García
  (m_id,45,'away','saved','center',4,'Quiroga',11,'García',1,17,12,true,'igualdad','6m','penetracion'),

  -- MIN 46: Norte Ferreyra lateral GOL 9m
  (m_id,46,'away','goal','left_back',3,'Ferreyra',13,'García',1,17,13,true,'igualdad','9m','habilidad'),

  -- MIN 47: GEI Rodríguez GOL desde 12m
  (m_id,47,'home','goal','right_back',5,'Rodríguez',11,'Navarro',1,18,13,true,'igualdad','12m','salto'),

  -- MIN 48: Norte Romero GOL de finta
  (m_id,48,'away','goal','right_back',2,'Romero',4,'García',1,18,14,true,'igualdad','9m','finta'),

  -- MIN 49: GEI EXCLUSIÓN Morales 2 min
  (m_id,49,'home','exclusion',null,null,'Morales',5,null,null,18,14,true,'igualdad',null,null),

  -- MIN 50: Norte superioridad Benítez ATAJADA García CLAVE
  (m_id,50,'away','saved','center',1,'Benítez',9,'García',1,18,14,true,'superioridad','9m','salto'),

  -- MIN 51: GEI López inferioridad contraataque GOL
  (m_id,51,'home','goal','right_wing',2,'López',5,'Navarro',1,19,14,true,'inferioridad','6m','penetracion'),

  -- MIN 52: Norte Núñez extremo errado
  (m_id,52,'away','miss','left_wing',0,'Núñez',3,'García',1,19,14,true,'igualdad','6m','finta'),

  -- MIN 53: Norte Quiroga pivote GOL descuento
  (m_id,53,'away','goal','pivot',3,'Quiroga',11,'García',1,19,15,true,'igualdad','6m','penetracion'),

  -- MIN 54: GEI Vera penetración GOL espectacular
  (m_id,54,'home','goal','pivot',7,'Vera',9,'Navarro',1,20,15,true,'igualdad','6m','penetracion'),

  -- MIN 55: Norte Suárez extremo ATAJADA García
  (m_id,55,'away','saved','left_wing',6,'Suárez',7,'García',1,20,15,true,'igualdad','6m','salto'),

  -- MIN 56: Norte Benítez 9m errado nervioso
  (m_id,56,'away','miss','center',4,'Benítez',9,'García',1,20,15,true,'igualdad','9m','salto'),

  -- MIN 57: GEI Ruiz habilidad GOL define
  (m_id,57,'home','goal','left_back',1,'Ruiz',6,'Navarro',1,21,15,true,'igualdad','9m','habilidad'),

  -- MIN 58: Norte Ferreyra desesperado GOL
  (m_id,58,'away','goal','right_back',5,'Ferreyra',13,'García',1,21,16,true,'igualdad','9m','salto'),

  -- MIN 59: Norte Romero EXCLUSIÓN 2 min final
  (m_id,59,'away','exclusion',null,null,'Romero',4,null,null,21,16,true,'igualdad',null,null),

  -- MIN 60: GEI Morales superioridad GOL final partido
  (m_id,60,'home','goal','center',4,'Morales',5,'Navarro',1,23,19,true,'superioridad','9m','salto');

end $$;
