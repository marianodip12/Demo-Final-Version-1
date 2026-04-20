import { useMemo } from "react";
import { T } from "../utils/constants.js";
import { buildSeasonStats, computeMatchStats } from "../utils/calculations.js";
import { Card, ScoreChart, Badge } from "../components/shared.jsx";

function SimpleLineChart({ data, color = T.accent, label }) {
  if (!data || data.length < 2) return null;
  const W = 300, H = 70, PL = 22, PR = 8, PT = 6, PB = 14;
  const iW = W - PL - PR, iH = H - PT - PB;
  const maxV = Math.max(...data.map(d => d.v), 1);
  const minV = 0;
  const xS = i => (i / (data.length - 1)) * iW + PL;
  const yS = v => H - PB - ((v - minV) / (maxV - minV || 1)) * iH;
  const pts = data.map((d, i) => `${xS(i)},${yS(d.v)}`).join(" ");

  return (
    <div>
      <div style={{ fontSize: 10, color: T.muted, marginBottom: 4 }}>{label}</div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%">
        {[0, Math.round(maxV / 2), maxV].map(v => (
          <g key={v}>
            <line x1={PL} y1={yS(v)} x2={W - PR} y2={yS(v)} stroke={T.border} strokeWidth=".5" />
            <text x={PL - 3} y={yS(v) + 3} textAnchor="end" style={{ fontSize: 7, fill: T.muted }}>{v}</text>
          </g>
        ))}
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        {data.map((d, i) => (
          <g key={i}>
            <circle cx={xS(i)} cy={yS(d.v)} r="3" fill={color} />
            <text x={xS(i)} y={H - 2} textAnchor="middle" style={{ fontSize: 7, fill: T.muted }}>{d.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export function Evolution({ completedMatches, homeTeamName, onViewMatch, goBack, singleMatch }) {
  // Single match evolution view
  if (singleMatch) {
    const events = singleMatch.events || [];
    const homeC = singleMatch.hc || T.accent;
    const awayC = singleMatch.ac || "#64748b";

    return (
      <div>
        <button onClick={goBack}
          style={{ background: "transparent", border: "none", color: T.muted, fontSize: 13, cursor: "pointer", marginBottom: 14, padding: 0, display: "flex", alignItems: "center", gap: 6 }}>
          ← Volver
        </button>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: T.accent, letterSpacing: 3, textTransform: "uppercase", marginBottom: 4 }}>Evolución del Partido</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: T.text }}>{singleMatch.home} vs {singleMatch.away}</div>
          <div style={{ fontSize: 11, color: T.muted }}>{singleMatch.date} {singleMatch.competition && `· ${singleMatch.competition}`}</div>
        </div>

        <div style={{ background: `linear-gradient(135deg,${homeC}20,${awayC}20)`, borderRadius: 14, padding: "14px 16px", border: `1px solid ${T.border}`, marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ textAlign: "center", flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: T.text, marginBottom: 4 }}>{singleMatch.home}</div>
              <div style={{ fontSize: 48, fontWeight: 900, color: homeC, lineHeight: 1 }}>{singleMatch.hs}</div>
            </div>
            <div style={{ textAlign: "center", padding: "0 12px" }}>
              <div style={{ fontSize: 10, color: T.muted, letterSpacing: 2 }}>FINAL</div>
              <div style={{ fontSize: 16, color: T.muted }}>–</div>
            </div>
            <div style={{ textAlign: "center", flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: T.text, marginBottom: 4 }}>{singleMatch.away}</div>
              <div style={{ fontSize: 48, fontWeight: 900, color: awayC, lineHeight: 1 }}>{singleMatch.as}</div>
            </div>
          </div>
        </div>

        <Card style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 10 }}>📈 Evolución del marcador</div>
          <ScoreChart events={events} homeColor={homeC} awayColor={awayC} />
          <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 8 }}>
            {[{ c: homeC, l: singleMatch.home }, { c: awayC, l: singleMatch.away }].map(x => (
              <div key={x.l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 14, height: 3, background: x.c, borderRadius: 2 }} />
                <span style={{ fontSize: 10, color: T.muted }}>{x.l}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  // Season evolution view
  const myTeam = homeTeamName || "Mi equipo";
  const season = useMemo(() => buildSeasonStats(completedMatches, myTeam), [completedMatches, myTeam]);

  const matchesWithStats = useMemo(() =>
    completedMatches.map(m => ({
      ...m,
      stats: computeMatchStats(m.events || []),
    })),
  [completedMatches]);

  const chartGoals = matchesWithStats
    .filter(m => m.home === myTeam || m.away === myTeam)
    .slice(0, 10)
    .reverse()
    .map((m, i) => ({
      v: m.home === myTeam ? m.hs : m.as,
      label: `P${i + 1}`,
    }));

  const chartEfficiency = matchesWithStats
    .filter(m => m.home === myTeam || m.away === myTeam)
    .slice(0, 10)
    .reverse()
    .map((m, i) => ({
      v: m.home === myTeam ? m.stats.homePct : m.stats.awayPct,
      label: `P${i + 1}`,
    }));

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: T.accent, letterSpacing: 3, textTransform: "uppercase", marginBottom: 4 }}>Temporada 2025</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: T.text }}>Evolución</div>
      </div>

      {completedMatches.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 20px", color: T.muted }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>📈</div>
          <div style={{ fontSize: 13 }}>Sin partidos completados aún</div>
        </div>
      ) : (
        <>
          {/* Season summary */}
          <Card style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 10 }}>🏆 Resumen de temporada — {myTeam}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 10 }}>
              {[
                { l: "Partidos", v: season.total, c: T.text },
                { l: "Victorias", v: season.w, c: T.green },
                { l: "Derrotas", v: season.l, c: T.red },
                { l: "Puntos", v: season.pts, c: T.accent },
              ].map(k => (
                <div key={k.l} style={{ textAlign: "center", background: T.card2, borderRadius: 10, padding: "10px 4px", border: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: k.c, lineHeight: 1 }}>{k.v}</div>
                  <div style={{ fontSize: 9, color: T.muted, marginTop: 3 }}>{k.l}</div>
                </div>
              ))}
            </div>

            {/* GF/GC */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ fontSize: 11, color: T.muted, width: 50 }}>GF/GC</div>
              <div style={{ flex: 1, height: 8, background: T.border, borderRadius: 4, overflow: "hidden", display: "flex" }}>
                <div style={{ width: `${season.gf / (season.gf + season.ga || 1) * 100}%`, background: T.green, borderRadius: "4px 0 0 4px" }} />
                <div style={{ flex: 1, background: T.red, borderRadius: "0 4px 4px 0" }} />
              </div>
              <span style={{ fontSize: 11, color: T.green, fontWeight: 700 }}>{season.gf}</span>
              <span style={{ fontSize: 10, color: T.muted }}>–</span>
              <span style={{ fontSize: 11, color: T.red, fontWeight: 700 }}>{season.ga}</span>
            </div>
          </Card>

          {/* Goals chart */}
          {chartGoals.length >= 2 && (
            <Card style={{ marginBottom: 12 }}>
              <SimpleLineChart data={chartGoals} color={T.green} label="Goles anotados por partido" />
            </Card>
          )}

          {/* Efficiency chart */}
          {chartEfficiency.length >= 2 && (
            <Card style={{ marginBottom: 12 }}>
              <SimpleLineChart data={chartEfficiency} color={T.accent} label="% Efectividad por partido" />
            </Card>
          )}

          {/* Match history */}
          <div style={{ fontSize: 9, color: T.muted, letterSpacing: 2, marginBottom: 8, textTransform: "uppercase" }}>PARTIDOS</div>
          {completedMatches.map(m => {
            const isHome = m.home === myTeam, isAway = m.away === myTeam;
            if (!isHome && !isAway) return null;
            const myG = isHome ? m.hs : m.as, oppG = isHome ? m.as : m.hs;
            const res = myG > oppG ? "W" : myG === oppG ? "D" : "L";
            const col = res === "W" ? T.green : res === "D" ? T.yellow : T.red;
            return (
              <button key={m.id} onClick={() => onViewMatch && onViewMatch(m)}
                style={{ width: "100%", background: T.card, borderRadius: 12, border: `1px solid ${T.border}`, padding: "11px 13px", marginBottom: 7, display: "flex", alignItems: "center", gap: 10, cursor: "pointer", textAlign: "left" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: col + "22", border: `2px solid ${col}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 9, fontWeight: 800, color: col }}>{res}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{m.home} {m.hs}–{m.as} {m.away}</div>
                  <div style={{ fontSize: 10, color: T.muted }}>{m.date}{m.competition ? ` · ${m.competition}` : ""}</div>
                </div>
                <span style={{ fontSize: 11, color: T.muted }}>›</span>
              </button>
            );
          })}
        </>
      )}
    </div>
  );
}
