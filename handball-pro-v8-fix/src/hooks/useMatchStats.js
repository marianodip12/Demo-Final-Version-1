import { useMemo } from "react";
import { computeMatchStats, computeScore, buildGoalkeeperMap, buildHeatCounts, buildByQuadrant, buildScorers } from "../utils/calculations.js";

export function useMatchStats(events) {
  const score = useMemo(() => computeScore(events), [events]);
  const stats = useMemo(() => computeMatchStats(events), [events]);

  const homeShots = useMemo(() =>
    events.filter(e => ["goal","miss","saved"].includes(e.type) && e.team === "home"),
  [events]);

  const awayShots = useMemo(() =>
    events.filter(e => ["goal","miss","saved"].includes(e.type) && e.team === "away"),
  [events]);

  const heatCounts = useMemo(() => buildHeatCounts(events), [events]);

  const byQuadrant = useMemo(() => buildByQuadrant(homeShots), [homeShots]);

  const scorers = useMemo(() => buildScorers(events), [events]);

  const goalkeeperMap = useMemo(() => buildGoalkeeperMap(events, "away"), [events]);
  const rivalGKMap    = useMemo(() => buildGoalkeeperMap(events, "home"), [events]);

  const pendingEvents = useMemo(() =>
    events.filter(e => !e.completed && ["goal","miss","saved"].includes(e.type)),
  [events]);

  return {
    score,
    stats,
    homeShots,
    awayShots,
    heatCounts,
    byQuadrant,
    scorers,
    goalkeeperMap,
    rivalGKMap,
    pendingEvents,
  };
}
