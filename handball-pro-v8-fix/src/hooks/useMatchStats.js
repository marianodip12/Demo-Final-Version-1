import { useMemo } from "react";
import { computeMatchStats, computeScore, buildGoalkeeperMap, buildHeatCounts, buildHeatCountsByTeam, buildByQuadrant, buildScorers } from "../utils/calculations.js";

export function useMatchStats(events) {
  const score = useMemo(() => computeScore(events), [events]);
  const stats = useMemo(() => computeMatchStats(events), [events]);

  const homeShots = useMemo(() =>
    events.filter(e => ["goal","miss","saved","post"].includes(e.type) && e.team === "home"),
  [events]);

  const awayShots = useMemo(() =>
    events.filter(e => ["goal","miss","saved","post"].includes(e.type) && e.team === "away"),
  [events]);

  // All-events heatmap (legacy, keep for MatchAnalysis)
  const heatCounts = useMemo(() => buildHeatCounts(events), [events]);

  // Per-team heatmaps for CourtModule
  const homeHeatCounts = useMemo(() => buildHeatCountsByTeam(events, "home"), [events]);
  const awayHeatCounts = useMemo(() => buildHeatCountsByTeam(events, "away"), [events]);

  const byQuadrant     = useMemo(() => buildByQuadrant(homeShots), [homeShots]);
  const homeByQuadrant = useMemo(() => buildByQuadrant(homeShots), [homeShots]);
  const awayByQuadrant = useMemo(() => buildByQuadrant(awayShots), [awayShots]);

  const scorers = useMemo(() => buildScorers(events), [events]);

  const goalkeeperMap = useMemo(() => buildGoalkeeperMap(events, "away"), [events]);
  const rivalGKMap    = useMemo(() => buildGoalkeeperMap(events, "home"), [events]);

  const pendingEvents = useMemo(() =>
    events.filter(e => !e.completed && ["goal","miss","saved"].includes(e.type)),
  [events]);

  return {
    score, stats,
    homeShots, awayShots,
    heatCounts, homeHeatCounts, awayHeatCounts,
    byQuadrant, homeByQuadrant, awayByQuadrant,
    scorers, goalkeeperMap, rivalGKMap,
    pendingEvents,
  };
}
