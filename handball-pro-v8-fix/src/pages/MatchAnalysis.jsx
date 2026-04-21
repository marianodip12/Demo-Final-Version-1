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
  const getVal = (q) => mode === "goals" ? q.goals : mode === "saved" ? q.saved : mode === "miss" ? (q.miss||0)+(q.post||0) : q.total;
  const maxV = Math.max(...byQ.map(getVal), 1);

  // SVG goal: viewBox 0 0 320 140, same as CourtModule
  // Cols: 6..108 | 109..211 | 212..314 | rows: 9..52 | 53..96 | 97..139
  const GX=[6,109,212], GW=[102,102,102], GY=[9,53,97], GH=43;
  const z9=[
    {gz:0,c:0,r:0},{gz:1,c:1,r:0},{gz:2,c:2,r:0},
    {gz:3,c:0,r:1},{gz:4,c:1,r:1},{gz:5,c:2,r:1},
    {gz:6,c:0,r:2},{gz:7,c:1,r:2},{gz:8,c:2,r:2},
  ];

  return (
    <div>
      <div style={{ background: "#0a1e3a", borderRadius: 10, overflow: "hidden", border: `1px solid ${T.border}` }}>
        <svg viewBox="0 0 320 140" width="100%" style={{ display: "block" }} preserveAspectRatio="xMidYMid meet">
          {/* Interior */}
          <rect x="6" y="8" width="308" height="132" fill="#0d2240"/>
          {/* Grid */}
          <line x1="6"   y1="52"  x2="314" y2="52"  stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
          <line x1="6"   y1="96"  x2="314" y2="96"  stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
          <line x1="108" y1="8"   x2="108" y2="140" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
          <line x1="211" y1="8"   x2="211" y2="140" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
          {[56,160,265].map(x=><line key={x} x1={x} y1="8" x2={x} y2="140" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>)}
          {[30,74,118].map(y=><line key={y} x1="6" y1={y} x2="314" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>)}
          {/* 9 zones */}
          {z9.map(({gz,c,r})=>{
            const q=byQ?.find(q=>q.id===gz)||{goals:0,saved:0,miss:0,total:0};
            const val=getVal(q);
            const intensity=maxV>0?val/maxV:0;
            const x=GX[c], y=GY[r], w=GW[c], h=GH;
            const bg = intensity>0
              ? `${modeColor}${Math.round(intensity*0.55*255).toString(16).padStart(2,"0")}`
              : "rgba(255,255,255,0.04)";
            return (
              <g key={gz}>
                <rect x={x} y={y} width={w} height={h} rx="2" fill={bg}
                  stroke={intensity>0?modeColor+"55":"rgba(255,255,255,0.13)"} strokeWidth="1"/>
                {val>0
                  ? <text x={x+w/2} y={y+h/2+5} textAnchor="middle" fill="#fff"
                      fontSize="15" fontWeight="900" fontFamily="Arial,sans-serif"
                      style={{pointerEvents:"none"}}>{val}</text>
                  : <text x={x+w/2} y={y+h/2+4} textAnchor="middle"
                      fill="rgba(255,255,255,0.18)" fontSize="13"
                      style={{pointerEvents:"none"}}>{QUADRANTS[gz]?.icon}</text>}
              </g>
            );
          })}
          {/* Goal frame */}
          <line x1="0"   y1="8" x2="320" y2="8"   stroke="#e8453c" strokeWidth="6" strokeLinecap="round"/>
          <line x1="5"   y1="8" x2="5"   y2="140" stroke="#e8453c" strokeWidth="6" strokeLinecap="round"/>
          <line x1="315" y1="8" x2="315" y2="140" stroke="#e8453c" strokeWidth="6" strokeLinecap="round"/>
        </svg>
      </div>
    </div>
  );
}

export function MatchAnalysis({ matchEvents = [], matchTitle, onBack, homeTeamName, matchData }) {
  const [tab, setTab]         = useState("team");
  const [subTab, setSubTab]   = useState("chart");
  const [goalMode, setGoalMode] = useState("goals");
  const [evFilter, setEvFilter] = useState("all");
  const [viewTeam, setViewTeam] = useState("home"); // "home" | "away" — equipo que se está viendo

  const { stats, goalkeeperMap, rivalGKMap, byQuadrant } = useMatchStats(matchEvents);
  const homeC = matchData?.hc || T.accent;
  const awayC = matchData?.ac || "#64748b";
  const homeName = matchData?.home || homeTeamName || "Local";
  const awayName = matchData?.away || "Rival";

  const scorers = useMemo(() => buildScorers(matchEvents), [matchEvents]);
  const homeShots = useMemo(() => matchEvents.filter(e => ["goal","miss","saved","post"].includes(e.type) && e.team === "home"), [matchEvents]);
  const awayShots = useMemo(() => matchEvents.filter(e => ["goal","miss","saved","post"].includes(e.type) && e.team === "away"), [matchEvents]);
  const homeByQ = useMemo(() => buildByQuadrant(homeShots), [homeShots]);
  const awayByQ = useMemo(() => buildByQuadrant(awayShots), [awayShots]);

  // Stats para el equipo que se está viendo
  const viewStats = viewTeam === "home" ? {
    goals:    stats.homeGoals,    shots:   stats.homeShots,
    pct:      stats.homePct,      saved:   stats.homeSaved,
    miss:     stats.homeMiss,     turnover:stats.homeTurnover,
    excl:     stats.homeExcl,     penals:  stats.homePenals,
    gkSaved:  stats.rivalGKSaved, gkPct:   stats.rivalGKPct,
    goalsAgainst: stats.awayGoals,
    byQ:      homeByQ,
  } : {
    goals:    stats.awayGoals,    shots:   stats.awayShots,
    pct:      stats.awayPct,      saved:   stats.awaySaved,
    miss:     stats.awayMiss,     turnover:stats.awayTurnover,
    excl:     stats.awayExcl,     penals:  stats.awayPenals,
    gkSaved:  stats.homeGKSaved,  gkPct:   stats.homeGKPct,
    goalsAgainst: stats.homeGoals,
    byQ:      awayByQ,
  };
  const viewName  = viewTeam === "home" ? homeName : awayName;
  const viewColor = viewTeam === "home" ? homeC : awayC;
  const rivalGKLabel = viewTeam === "home" ? awayName : homeName;

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

      {/* ── TEAM TOGGLE — quién estamos viendo ── */}
      <div style={{ display: "flex", gap: 4, marginBottom: 12, background: T.card, borderRadius: 12, padding: 4, border: `1px solid ${T.border}` }}>
        {[{ k: "home", label: homeName, color: homeC }, { k: "away", label: awayName, color: awayC }].map(t => (
          <button key={t.k} onClick={() => setViewTeam(t.k)} style={{
            flex: 1, background: viewTeam === t.k ? t.color + "22" : "transparent",
            color: viewTeam === t.k ? t.color : T.muted,
            border: `1.5px solid ${viewTeam === t.k ? t.color : "transparent"}`,
            borderRadius: 9, padding: "9px 6px", fontWeight: 800, fontSize: 12,
            cursor: "pointer", transition: "all .15s",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: viewTeam === t.k ? t.color : T.muted }} />
            {t.label}
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
              {/* Focused stats for selected team */}
              <div style={{ background: viewColor + "12", borderRadius: 12, border: `1px solid ${viewColor}33`, padding: "12px", marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: viewColor, marginBottom: 10 }}>📊 {viewName}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 8 }}>
                  {[
                    { l: "Goles", v: viewStats.goals, c: T.green },
                    { l: "Tiros", v: viewStats.shots, c: T.text },
                    { l: "Efect.", v: `${viewStats.pct}%`, c: viewStats.pct >= 50 ? T.green : viewStats.pct >= 35 ? T.yellow : T.red },
                    { l: "Ataj. recib.", v: viewStats.saved, c: "#60a5fa" },
                    { l: "Errados", v: viewStats.miss, c: T.red },
                    { l: "Pérdidas", v: viewStats.turnover, c: T.yellow },
                    { l: "Exclusiones", v: viewStats.excl, c: T.orange },
                    { l: "Penales", v: viewStats.penals, c: T.purple },
                    { l: "Goles contr.", v: viewStats.goalsAgainst, c: viewStats.goalsAgainst > viewStats.goals ? T.red : T.muted },
                  ].map(k => (
                    <div key={k.l} style={{ background: T.card, borderRadius: 9, padding: "8px 4px", border: `1px solid ${T.border}`, textAlign: "center" }}>
                      <div style={{ fontSize: 18, fontWeight: 900, color: k.c, lineHeight: 1 }}>{k.v}</div>
                      <div style={{ fontSize: 8, color: T.muted, marginTop: 2 }}>{k.l}</div>
                    </div>
                  ))}
                </div>
                {/* GK efficiency of rival */}
                <div style={{ background: T.card, borderRadius: 9, padding: "8px 12px", border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, color: T.muted }}>🧤 Arq. {rivalGKLabel} — {viewStats.gkSaved} atajadas</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: viewStats.gkPct > 40 ? T.orange : T.green }}>{viewStats.gkPct}%</span>
                </div>
              </div>

              {/* Comparison bars */}
              <div style={{ fontSize: 10, color: T.muted, letterSpacing: 2, marginBottom: 8, textTransform: "uppercase" }}>Comparativa</div>
              <StatBar label="Goles" home={stats.homeGoals} away={stats.awayGoals} homeColor={homeC} awayColor={awayC} color={T.green} />
              <StatBar label="Tiros totales" home={stats.homeShots} away={stats.awayShots} homeColor={homeC} awayColor={awayC} />
              <StatBar label="Exclusiones" home={stats.homeExcl} away={stats.awayExcl} homeColor={homeC} awayColor={awayC} color={T.orange} />
              <StatBar label="Pérdidas" home={stats.homeTurnover} away={stats.awayTurnover} homeColor={homeC} awayColor={awayC} color={T.red} />
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
      {tab === "zones" && (() => {
        const viewShots = viewTeam === "home" ? homeShots : awayShots;
        const viewByQ   = viewTeam === "home" ? homeByQ  : awayByQ;
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Card>
              <Heatmap events={viewShots} title={`Tiros ${viewName}`} />
            </Card>

            {viewShots.some(e => e.quadrant != null) && (
              <Card>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 10 }}>🥅 Mapa del arco — {viewName}</div>
                <div style={{ display: "flex", gap: 5, marginBottom: 8 }}>
                  {[{ k: "goals", l: "⚽ Goles", c: T.green }, { k: "saved", l: "🧤 Ataj.", c: "#60a5fa" }, { k: "miss", l: "❌ Err.", c: T.red }, { k: "total", l: "📊 Total", c: T.yellow }].map(m => (
                    <button key={m.k} onClick={() => setGoalMode(m.k)}
                      style={{ flex: 1, background: goalMode === m.k ? m.c + "28" : T.card, color: goalMode === m.k ? m.c : T.muted, border: `1px solid ${goalMode === m.k ? m.c : T.border}`, borderRadius: 8, padding: "7px 2px", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>
                      {m.l}
                    </button>
                  ))}
                </div>
                <GoalMap byQ={viewByQ} mode={goalMode} />
              </Card>
            )}
          </div>
        );
      })()}

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
