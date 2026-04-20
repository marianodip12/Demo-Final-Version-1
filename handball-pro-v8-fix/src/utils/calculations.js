import { ZONES, QUADRANTS } from "./constants.js";

// ─── DB MAPPERS ──────────────────────────────────────────
export const mapDbEvent = (e) => ({
  id: e.id,
  min: e.minute,
  team: e.team,
  type: e.type,
  zone: e.zone,
  quadrant: e.quadrant,
  goalSection: e.goal_section || null,
  attackSide: e.attack_side,
  distance: e.distance || null,
  situation: e.situation || null,
  throwType: e.throw_type || null,
  shooter: e.shooter_name ? { name: e.shooter_name, number: e.shooter_number } : null,
  goalkeeper: e.goalkeeper_name ? { name: e.goalkeeper_name, number: e.goalkeeper_number } : null,
  sanctioned: e.sanctioned_name ? { name: e.sanctioned_name, number: e.sanctioned_number } : null,
  hScore: e.h_score,
  aScore: e.a_score,
  completed: e.completed,
  quickMode: e.quick_mode,
});

export const mapDbMatch = (m) => ({
  id: m.id,
  home: m.home_name,
  away: m.away_name,
  hs: m.home_score,
  as: m.away_score,
  date: m.match_date || "",
  hc: m.home_color,
  ac: m.away_color,
  competition: m.competition || "",
  events: (m.events || []).map(mapDbEvent).sort((a, b) => a.min - b.min),
});

// ─── SCORE COMPUTATION ──────────────────────────────────
export const computeScore = (events) => {
  const last = events.filter(e => e.hScore != null).slice(-1)[0];
  return last ? { h: last.hScore, a: last.aScore } : { h: 0, a: 0 };
};

export const calcNextScore = (events, type, team) => {
  const prev = events.filter(e => e.hScore != null).slice(-1)[0] || { hScore: 0, aScore: 0 };
  let { hScore, aScore } = prev;
  if (type === "goal") { team === "home" ? hScore++ : aScore++; }
  return { hScore, aScore };
};

// ─── STATS FROM EVENTS ──────────────────────────────────
export const computeMatchStats = (events) => {
  const homeGoals   = events.filter(e => e.type === "goal" && e.team === "home").length;
  const awayGoals   = events.filter(e => e.type === "goal" && e.team === "away").length;
  const homeShots   = events.filter(e => ["goal","miss","saved","post"].includes(e.type) && e.team === "home").length;
  const awayShots   = events.filter(e => ["goal","miss","saved","post"].includes(e.type) && e.team === "away").length;
  const homeSaved   = events.filter(e => e.type === "saved" && e.team === "home").length;
  const awaySaved   = events.filter(e => e.type === "saved" && e.team === "away").length;
  const homeMiss    = events.filter(e => e.type === "miss" && e.team === "home").length;
  const awayMiss    = events.filter(e => e.type === "miss" && e.team === "away").length;
  const homeExcl    = events.filter(e => e.type === "exclusion" && e.team === "home").length;
  const awayExcl    = events.filter(e => e.type === "exclusion" && e.team === "away").length;
  const homeTm      = events.filter(e => e.type === "timeout" && e.team === "home").length;
  const awayTm      = events.filter(e => e.type === "timeout" && e.team === "away").length;
  const homeTurnover= events.filter(e => e.type === "turnover" && e.team === "home").length;
  const awayTurnover= events.filter(e => e.type === "turnover" && e.team === "away").length;

  const homePct = homeShots ? Math.round(homeGoals / homeShots * 100) : 0;
  const awayPct = awayShots ? Math.round(awayGoals / awayShots * 100) : 0;

  // GK % = saves / (goals + saves)  ← tiros al arco reales (excluye errados/palos)
  const rivalGKSaved = homeSaved;
  const rivalGKGoals = homeGoals;
  const rivalGKTotal = rivalGKSaved + rivalGKGoals;   // tiros al arco del equipo local
  const rivalGKPct   = rivalGKTotal ? Math.round(rivalGKSaved / rivalGKTotal * 100) : 0;

  const homeGKSaved = awaySaved;
  const homeGKGoals = awayGoals;
  const homeGKTotal = homeGKSaved + homeGKGoals;      // tiros al arco del equipo visitante
  const homeGKPct   = homeGKTotal ? Math.round(homeGKSaved / homeGKTotal * 100) : 0;

  // Penalties
  const homePenals   = events.filter(e => (e.zone === "penal" || e.distance === "penal") && e.team === "home").length;
  const awayPenals   = events.filter(e => (e.zone === "penal" || e.distance === "penal") && e.team === "away").length;

  return {
    homeGoals, awayGoals,
    homeShots, awayShots,
    homeSaved, awaySaved,
    homeMiss, awayMiss,
    homeExcl, awayExcl,
    homeTm, awayTm,
    homeTurnover, awayTurnover,
    homePct, awayPct,
    rivalGKTotal, rivalGKSaved, rivalGKPct,
    homeGKSaved, homeGKTotal, homeGKPct,
    homePenals, awayPenals,
  };
};

// ─── GOALKEEPER QUADRANT MAP ─────────────────────────────
export const buildGoalkeeperMap = (events, team) => {
  const namedGKs = {};
  const quickData = { saved: 0, goals: 0, miss: 0, total: 0 };

  events.filter(e => ["goal","saved","miss"].includes(e.type) && e.team === team).forEach(e => {
    if (!e.quickMode && e.goalkeeper) {
      const key = e.goalkeeper.name;
      if (!namedGKs[key]) {
        namedGKs[key] = {
          name: e.goalkeeper.name,
          number: e.goalkeeper.number,
          saved: 0, goals: 0, miss: 0, total: 0,
          byQ: QUADRANTS.map(() => ({ saved: 0, goals: 0, miss: 0, total: 0 })),
        };
      }
      const gk = namedGKs[key];
      gk.total++;
      if (e.type === "saved") gk.saved++;
      else if (e.type === "goal") gk.goals++;
      else gk.miss++;
      if (e.quadrant != null && e.quadrant >= 0 && e.quadrant <= 8) {
        gk.byQ[e.quadrant].total++;
        if (e.type === "saved") gk.byQ[e.quadrant].saved++;
        else if (e.type === "goal") gk.byQ[e.quadrant].goals++;
        else gk.byQ[e.quadrant].miss++;
      }
    } else if (e.quickMode) {
      quickData.total++;
      if (e.type === "saved") quickData.saved++;
      else if (e.type === "goal") quickData.goals++;
      else quickData.miss++;
    }
  });

  return {
    named: Object.values(namedGKs).sort((a, b) => b.total - a.total),
    quick: quickData.total > 0 ? quickData : null,
  };
};

// ─── ZONE HEATMAP DATA ───────────────────────────────────
export const buildHeatCounts = (events) => {
  const c = {};
  events.filter(e => e.zone).forEach(e => {
    c[e.zone] = (c[e.zone] || 0) + 1;
  });
  return c;
};

export const buildHeatCountsByTeam = (events, team) => {
  const c = {};
  events.filter(e => e.zone && e.team === team).forEach(e => {
    c[e.zone] = (c[e.zone] || 0) + 1;
  });
  return c;
};

// ─── QUADRANT GRID DATA ──────────────────────────────────
export const buildByQuadrant = (shots) => {
  return QUADRANTS.map(q => {
    const qs = shots.filter(e => e.quadrant === q.id);
    return {
      id: q.id, label: q.label, icon: q.icon,
      goals: qs.filter(e => e.type === "goal").length,
      saved: qs.filter(e => e.type === "saved").length,
      miss:  qs.filter(e => e.type === "miss").length,
      total: qs.length,
    };
  });
};

// ─── SCORERS ─────────────────────────────────────────────
export const buildScorers = (events) => {
  const m = {};
  events.filter(e => e.type === "goal" && e.shooter).forEach(e => {
    const key = e.shooter.name;
    if (!m[key]) m[key] = { name: e.shooter.name, number: e.shooter.number, goals: 0, team: e.team };
    m[key].goals++;
  });
  return Object.values(m).sort((a, b) => b.goals - a.goals);
};

// ─── SEASON STATS ────────────────────────────────────────
export const buildSeasonStats = (completedMatches, myTeamName) => {
  let w = 0, d = 0, l = 0, gf = 0, ga = 0;
  completedMatches.forEach(m => {
    const isHome = m.home === myTeamName;
    const isAway = m.away === myTeamName;
    if (!isHome && !isAway) return;
    const myG = isHome ? m.hs : m.as;
    const oppG = isHome ? m.as : m.hs;
    gf += myG; ga += oppG;
    if (myG > oppG) w++;
    else if (myG === oppG) d++;
    else l++;
  });
  return { w, d, l, gf, ga, pts: w * 2 + d, total: w + d + l };
};

// ─── FORMAT TIME ─────────────────────────────────────────
export const fmtTime = (s) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};
