import { useState, useMemo } from "react";
import { T, ZONES, QUADRANTS, EV_TYPES } from "../utils/constants.js";
import { buildScorers, buildByQuadrant } from "../utils/calculations.js";
import { useMatchStats } from "../hooks/useMatchStats.js";
import { Heatmap } from "../components/Heatmap.jsx";
import { GoalkeeperGrid, GoalkeeperGridQuick } from "../components/GoalkeeperGrid.jsx";
import { ScoreChart, Card, SectionLabel, Badge, EventCard } from "../components/shared.jsx";

function StatBar({ label, home, away, homeColor = T.accent, awayColor = "#64748b", color }) {
  const tot = home + away || 1;
  return (
    <Card style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 11, color: T.muted, marginBottom: 6, textAlign: "center" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 16, fontWeight: 800, color: color || T.text, width: 24, textAlign: "right" }}>{home}</span>
        <div style={{ flex: 1, height: 6, background: T.border, borderRadius: 3, overflow: "hidden", display: "flex" }}>
          <div style={{ width: `${home / tot * 100}%`, background: homeColor, borderRadius: "3px 0 0 3px" }} />
          <div style={{ width: `${away / tot * 100}%`, background: awayColor, borderRadius: "0 3px 3px 0" }} />
        </div>
        <span style={{ fontSize: 16, fontWeight: 800, color: color || T.text, width: 24 }}>{away}</span>
      </div>
    </Card>
  );
}

function GoalMap({ byQ, mode }) {
  const modeColor = mode === "goals" ? T.green : mode === "saved" ? "#60a5fa" : mode === "miss" ? T.red : T.yellow;
  const maxV = Math.max(...byQ.map(q => mode === "goals" ? q.goals : mode === "saved" ? q.saved : mode === "miss" ? q.miss : q.total), 1);
  const rows = [[0, 1, 2], [3, 4, 5], [6, 7, 8]];
  return (
    <div>
      <div style={{ background: "#0c2340", borderRadius: 10, padding: "8px 6px", marginBottom: 8, border: `1px solid ${T.border}` }}>
        <svg viewBox="0 0 100 40" width="100%" style={{ display: "block" }}>
          <rect x="20" y="2" width="60" height="36" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="1.5" />
          <line x1="40" y1="2" x2="40" y2="38" stroke="rgba(255,255,255,.25)" strokeWidth=".8" />
          <line x1="60" y1="2" x2="60" y2="38" stroke="rgba(255,255,255,.25)" strokeWidth=".8" />
          <line x1="20" y1="15" x2="80" y2="15" stroke="rgba(255,255,255,.25)" strokeWidth=".8" />
          <line x1="20" y1="27" x2="80" y2="27" stroke="rgba(255,255,255,.25)" strokeWidth=".8" />
        </svg>
      </div>
      {rows.map((row, ri) => (
        <div key={ri} style={{ display: "flex", gap: 4, marginBottom: ri < 2 ? 4 : 0 }}>
          {row.map(qi => {
            const q = byQ[qi];
            const val = mode === "goals" ? q.goals : mode === "saved" ? q.saved : mode === "miss" ? q.miss : q.total;
            const intensity = q.total > 0 ? val / maxV : 0;
            return (
              <div key={qi} style={{
                flex: 1, borderRadius: 8, padding: "8px 4px", textAlign: "center",
                background: intensity > 0 ? modeColor + Math.round(intensity * 0.35 * 255).toString(16).padStart(2, "0") : "rgba(0,0,0,.2)",
                border: `1px solid ${intensity > 0 ? modeColor + "55" : T.border}`,
                minHeight: 46, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
              }}>
                {q.total > 0 ? (
                  <>
                    <div style={{ fontSize: 14, fontWeight: 900, color: intensity > 0 ? modeColor : T.muted, lineHeight: 1 }}>{val}</div>
                    <div style={{ fontSize: 8, color: T.muted }}>{QUADRANTS[qi].icon}</div>
                  </>
                ) : (
                  <span style={{ fontSize: 12, color: T.muted }}>{QUADRANTS[qi].icon}</span>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export function MatchAnalysis({ matchEvents = [], matchTitle, onBack, homeTeamName, matchData }) {
  const [tab, setTab]         = useState("team");
  const [subTab, setSubTab]   = useState("chart");
  const [goalMode, setGoalMode] = useState("goals");
  const [evFilter, setEvFilter] = useState("all");

  const { stats, goalkeeperMap, rivalGKMap, byQuadrant } = useMatchStats(matchEvents);
  const homeC = matchData?.hc || T.accent;
  const awayC = matchData?.ac || "#64748b";
  const homeName = matchData?.home || homeTeamName || "Local";
  const awayName = matchData?.away || "Rival";

  const scorers = useMemo(() => buildScorers(matchEvents), [matchEvents]);
  const homeShots = useMemo(() => matchEvents.filter(e => ["goal","miss","saved"].includes(e.type) && e.team === "home"), [matchEvents]);
  const awayShots = useMemo(() => matchEvents.filter(e => ["goal","miss","saved"].includes(e.type) && e.team === "away"), [matchEvents]);
  const homeByQ = useMemo(() => buildByQuadrant(homeShots), [homeShots]);

  const filteredEvents = useMemo(() =>
    evFilter === "all" ? matchEvents : matchEvents.filter(e => e.type === evFilter),
  [matchEvents, evFilter]);

  const TABS = [
    { k: "team",    l: "📊 Equipo" },
    { k: "players", l: "👥 Jugadores" },
    { k: "keeper",  l: "🧤 Arquero" },
    { k: "zones",   l: "🗺 Zonas" },
    { k: "timeline",l: "📋 Timeline" },
  ];

  return (
    <div>
      {/* Back + title */}
      <button onClick={onBack}
        style={{ background: "transparent", border: "none", color: T.muted, fontSize: 13, cursor: "pointer", marginBottom: 12, padding: 0, display: "flex", alignItems: "center", gap: 6 }}>
        ← Volver
      </button>

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: T.accent, letterSpacing: 3, textTransform: "uppercase", marginBottom: 4 }}>Análisis del Partido</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: T.text, marginBottom: 2 }}>{matchTitle}</div>
        {matchData?.date && <div style={{ fontSize: 11, color: T.muted }}>{matchData.date}{matchData.competition ? ` · ${matchData.competition}` : ""}</div>}
      </div>

      {/* Final score card */}
      <div style={{ background: `linear-gradient(135deg,${homeC}20,${awayC}20)`, borderRadius: 14, padding: "14px 16px", border: `1px solid ${T.border}`, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ textAlign: "center", flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: T.text, marginBottom: 4 }}>{homeName}</div>
            <div style={{ fontSize: 48, fontWeight: 900, color: homeC, lineHeight: 1 }}>{matchData?.hs ?? "–"}</div>
          </div>
          <div style={{ textAlign: "center", padding: "0 12px" }}>
            <div style={{ fontSize: 10, color: T.muted, letterSpacing: 2 }}>FINAL</div>
            <div style={{ fontSize: 16, color: T.muted }}>–</div>
          </div>
          <div style={{ textAlign: "center", flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: T.text, marginBottom: 4 }}>{awayName}</div>
            <div style={{ fontSize: 48, fontWeight: 900, color: awayC, lineHeight: 1 }}>{matchData?.as ?? "–"}</div>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 4, marginBottom: 14, overflowX: "auto", paddingBottom: 2 }}>
        {TABS.map(t => (
          <button key={t.k} onClick={() => setTab(t.k)}
            style={{
              flexShrink: 0, background: tab === t.k ? T.accent : T.card,
              color: tab === t.k ? "#fff" : T.muted,
              border: `1px solid ${tab === t.k ? T.accent : T.border}`,
              borderRadius: 9, padding: "8px 12px", fontSize: 10, fontWeight: 700, cursor: "pointer",
            }}>
            {t.l}
          </button>
        ))}
      </div>

      {/* ── TEAM TAB ── */}
      {tab === "team" && (
        <div>
          <div style={{ display: "flex", gap: 4, marginBottom: 12, background: T.card, borderRadius: 10, padding: 3 }}>
            {[{ k: "chart", l: "📈 Gráfico" }, { k: "stats", l: "📊 Stats" }].map(t => (
              <button key={t.k} onClick={() => setSubTab(t.k)}
                style={{ flex: 1, background: subTab === t.k ? T.accent : "transparent", color: subTab === t.k ? "#fff" : T.muted, border: "none", borderRadius: 8, padding: "8px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                {t.l}
              </button>
            ))}
          </div>

          {subTab === "chart" && (
            <Card>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 10 }}>📈 Evolución del marcador</div>
              <ScoreChart events={matchEvents} homeColor={homeC} awayColor={awayC} />
              <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 8 }}>
                {[{ c: homeC, l: homeName }, { c: awayC, l: awayName }].map(x => (
                  <div key={x.l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 14, height: 3, background: x.c, borderRadius: 2 }} />
                    <span style={{ fontSize: 10, color: T.muted }}>{x.l}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {subTab === "stats" && (
            <div>
              <StatBar label="Goles" home={stats.homeGoals} away={stats.awayGoals} homeColor={homeC} awayColor={awayC} color={T.green} />
              <StatBar label="Tiros totales" home={stats.homeShots} away={stats.awayShots} homeColor={homeC} awayColor={awayC} />
              <StatBar label="Atajadas" home={stats.homeSaved} away={stats.awaySaved} homeColor={homeC} awayColor={awayC} color="#60a5fa" />
              <StatBar label="Exclusiones" home={stats.homeExcl} away={stats.awayExcl} homeColor={homeC} awayColor={awayC} color={T.orange} />
              <StatBar label="Tiempos muertos" home={stats.homeTm} away={stats.awayTm} homeColor={homeC} awayColor={awayC} color={T.yellow} />
              <StatBar label="Pérdidas" home={stats.homeTurnover} away={stats.awayTurnover} homeColor={homeC} awayColor={awayC} color={T.red} />

              <Card>
                <div style={{ fontSize: 11, color: T.muted, marginBottom: 8, textAlign: "center" }}>% Efectividad</div>
                <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 28, fontWeight: 900, color: stats.homePct >= 50 ? T.green : stats.homePct >= 35 ? T.yellow : T.red }}>{stats.homePct}%</div>
                    <div style={{ fontSize: 10, color: T.muted }}>{homeName}</div>
                  </div>
                  <div style={{ width: 1, background: T.border, margin: "0 12px" }} />
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 28, fontWeight: 900, color: stats.awayPct >= 50 ? T.green : stats.awayPct >= 35 ? T.yellow : T.red }}>{stats.awayPct}%</div>
                    <div style={{ fontSize: 10, color: T.muted }}>{awayName}</div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* ── PLAYERS TAB ── */}
      {tab === "players" && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 10 }}>⚽ Goleadores</div>
          {scorers.length === 0
            ? <div style={{ textAlign: "center", color: T.muted, padding: "20px", fontSize: 12 }}>Sin goleadores registrados</div>
            : scorers.map((s, i) => (
              <Card key={s.name} style={{ marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 16 }}>{["🥇", "🥈", "🥉"][i] || "🏅"}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{s.name} <span style={{ color: T.muted, fontSize: 11 }}>#{s.number}</span></div>
                    <div style={{ fontSize: 10, color: T.muted }}>{s.team === "home" ? homeName : awayName}</div>
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: T.green }}>{s.goals}</div>
                </div>
              </Card>
            ))}
        </div>
      )}

      {/* ── KEEPER TAB ── */}
      {tab === "keeper" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 10, color: "#60a5fa", fontWeight: 700, letterSpacing: 1 }}>🧤 ARQUERO — {homeName}</div>
          {goalkeeperMap.named.length === 0 && !goalkeeperMap.quick
            ? <div style={{ textAlign: "center", padding: "20px", color: T.muted }}>Sin datos de arquero registrados</div>
            : goalkeeperMap.named.map(gk => <GoalkeeperGrid key={gk.name} gk={gk} />)
          }
          {goalkeeperMap.quick && <GoalkeeperGridQuick data={goalkeeperMap.quick} title="Datos rápidos (sin detalle)" />}

          <div style={{ marginTop: 6, fontSize: 10, color: T.orange, fontWeight: 700, letterSpacing: 1 }}>🥅 ARQ. RIVAL — {awayName}</div>
          {rivalGKMap.named.length === 0 && !rivalGKMap.quick
            ? <div style={{ textAlign: "center", padding: "10px", color: T.muted, fontSize: 11 }}>Sin datos del arquero rival</div>
            : rivalGKMap.named.map(gk => <GoalkeeperGrid key={gk.name} gk={gk} />)
          }
          {rivalGKMap.quick && <GoalkeeperGridQuick data={rivalGKMap.quick} title="Datos rápidos rival" />}
        </div>
      )}

      {/* ── ZONES TAB ── */}
      {tab === "zones" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Card>
            <Heatmap events={homeShots} title={`Tiros ${homeName}`} />
          </Card>

          {homeShots.some(e => e.quadrant != null) && (
            <Card>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 10 }}>🥅 Mapa del arco</div>
              <div style={{ display: "flex", gap: 5, marginBottom: 8 }}>
                {[{ k: "goals", l: "⚽ Goles", c: T.green }, { k: "saved", l: "🧤 Ataj.", c: "#60a5fa" }, { k: "miss", l: "❌ Err.", c: T.red }, { k: "total", l: "📊 Total", c: T.yellow }].map(m => (
                  <button key={m.k} onClick={() => setGoalMode(m.k)}
                    style={{ flex: 1, background: goalMode === m.k ? m.c + "28" : T.card, color: goalMode === m.k ? m.c : T.muted, border: `1px solid ${goalMode === m.k ? m.c : T.border}`, borderRadius: 8, padding: "7px 2px", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>
                    {m.l}
                  </button>
                ))}
              </div>
              <GoalMap byQ={homeByQ} mode={goalMode} />
            </Card>
          )}
        </div>
      )}

      {/* ── TIMELINE TAB ── */}
      {tab === "timeline" && (
        <div>
          <div style={{ display: "flex", gap: 4, marginBottom: 10, flexWrap: "wrap" }}>
            {[{ k: "all", l: "Todo" }, { k: "goal", l: "⚽" }, { k: "saved", l: "🧤" }, { k: "miss", l: "❌" }, { k: "exclusion", l: "⏱" }].map(f => (
              <button key={f.k} onClick={() => setEvFilter(f.k)}
                style={{ flex: 1, background: evFilter === f.k ? T.accent : T.card, color: evFilter === f.k ? "#fff" : T.muted, border: `1px solid ${evFilter === f.k ? T.accent : T.border}`, borderRadius: 8, padding: "6px 4px", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>
                {f.l}
              </button>
            ))}
          </div>
          {(() => {
            const half = matchEvents.find(e => e.type === "half_time");
            const htMin = half?.min || 30;
            const second = [...filteredEvents].filter(e => e.min > htMin || e.type === "half_time").reverse();
            const first  = [...filteredEvents].filter(e => e.min <= htMin && e.type !== "half_time").reverse();
            return (
              <div>
                {second.length > 0 && (
                  <div>
                    <div style={{ fontSize: 9, color: T.purple, letterSpacing: 2, fontWeight: 700, marginBottom: 6 }}>🔔 2° TIEMPO</div>
                    {second.map(ev => <EventCard key={ev.id} ev={ev} homeColor={homeC} awayColor={awayC} homeName={homeName} awayName={awayName} />)}
                  </div>
                )}
                {first.length > 0 && (
                  <div>
                    <div style={{ fontSize: 9, color: T.purple, letterSpacing: 2, fontWeight: 700, marginBottom: 6, marginTop: second.length > 0 ? 12 : 0 }}>🔔 1° TIEMPO</div>
                    {first.map(ev => <EventCard key={ev.id} ev={ev} homeColor={homeC} awayColor={awayC} homeName={homeName} awayName={awayName} />)}
                  </div>
                )}
                {filteredEvents.length === 0 && <div style={{ textAlign: "center", color: T.muted, padding: "20px", fontSize: 12 }}>Sin eventos</div>}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
