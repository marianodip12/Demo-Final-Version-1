import { useMemo } from "react";
import { T } from "../utils/constants.js";
import { buildSeasonStats } from "../utils/calculations.js";
import { Card, Btn, Badge } from "../components/shared.jsx";

export function Matches({
  matchStatus, liveMatchInfo, liveScore,
  completedMatches, homeTeam,
  onNewMatch, onGoLive,
  onViewAnalysis, onViewEvolution,
  onDeleteMatch, onReopenMatch,
}) {
  const myTeam = homeTeam?.name || "Mi equipo";

  const season = useMemo(() => buildSeasonStats(completedMatches, myTeam), [completedMatches, myTeam]);

  return (
    <div>
      <style>{`@keyframes blkR{0%,100%{opacity:1}50%{opacity:.2}}`}</style>

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: T.accent, letterSpacing: 3, textTransform: "uppercase", marginBottom: 4 }}>Handball Pro</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: T.text }}>Partidos</div>
          {matchStatus === "idle" && (
            <button onClick={onNewMatch}
              style={{ background: T.accent, border: "none", color: "#fff", borderRadius: 10, padding: "8px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              + Nuevo
            </button>
          )}
        </div>
        <div style={{ fontSize: 12, color: T.muted }}>Temporada 2025</div>
      </div>

      {/* Season summary */}
      {completedMatches.length > 0 && (
        <Card style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.text, marginBottom: 8 }}>📊 {myTeam} — Temporada</div>
          <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
            {[
              { l: "PJ", v: season.total, c: T.text },
              { l: "G",  v: season.w,    c: T.green },
              { l: "E",  v: season.d,    c: T.yellow },
              { l: "P",  v: season.l,    c: T.red },
              { l: "GF", v: season.gf,   c: T.text },
              { l: "GC", v: season.ga,   c: T.muted },
              { l: "Pts",v: season.pts,  c: T.accent },
            ].map(k => (
              <div key={k.l} style={{ flex: 1, textAlign: "center", background: T.card2, borderRadius: 7, padding: "5px 2px", border: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: k.c, lineHeight: 1 }}>{k.v}</div>
                <div style={{ fontSize: 7, color: T.muted, marginTop: 1 }}>{k.l}</div>
              </div>
            ))}
          </div>
          {/* Form badges */}
          <div style={{ display: "flex", gap: 4 }}>
            {[...completedMatches].slice(0, 6).reverse().map((m, i) => {
              const isHome = m.home === myTeam, isAway = m.away === myTeam;
              if (!isHome && !isAway) return null;
              const myG  = isHome ? m.hs : m.as;
              const oppG = isHome ? m.as : m.hs;
              const res  = myG > oppG ? "W" : myG === oppG ? "D" : "L";
              const col  = res === "W" ? T.green : res === "D" ? T.yellow : T.red;
              return (
                <div key={i} style={{ width: 26, height: 26, borderRadius: "50%", background: col + "22", border: `2px solid ${col}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 9, fontWeight: 800, color: col }}>{res}</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Live match banner */}
      {matchStatus === "live" && (
        <div style={{ background: "linear-gradient(135deg,#7f1d1d,#991b1b)", borderRadius: 14, padding: "12px 14px", marginBottom: 12, border: "1px solid #ef444444" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: T.red, display: "inline-block", animation: "blkR 1.2s infinite" }} />
            <span style={{ fontSize: 10, color: T.red, fontWeight: 700, letterSpacing: 2 }}>EN VIVO</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ textAlign: "center", flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#fff", marginBottom: 1 }}>{liveMatchInfo.home}</div>
              <div style={{ fontSize: 34, fontWeight: 900, color: "#fff" }}>{liveScore.h}</div>
            </div>
            <div style={{ color: "rgba(255,255,255,.4)", fontSize: 13 }}>VS</div>
            <div style={{ textAlign: "center", flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#fff", marginBottom: 1 }}>{liveMatchInfo.away}</div>
              <div style={{ fontSize: 34, fontWeight: 900, color: "#fff" }}>{liveScore.a}</div>
            </div>
          </div>
          <button onClick={onGoLive}
            style={{ width: "100%", background: "rgba(239,68,68,.25)", border: "1px solid rgba(239,68,68,.5)", color: "#fca5a5", borderRadius: 10, padding: "9px", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
            ➕ Ir al partido en vivo
          </button>
        </div>
      )}

      {/* Empty state */}
      {matchStatus === "idle" && completedMatches.length === 0 && (
        <div style={{ background: T.card, borderRadius: 14, border: `1px dashed ${T.border}`, padding: "24px", marginBottom: 12, textAlign: "center" }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>🤾</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.muted, marginBottom: 10 }}>Sin partidos aún</div>
          <Btn onClick={onNewMatch} color={T.accent}>+ Nuevo partido</Btn>
        </div>
      )}

      {/* History */}
      {completedMatches.length > 0 && (
        <>
          <div style={{ fontSize: 9, color: T.muted, letterSpacing: 2, marginBottom: 7, textTransform: "uppercase" }}>HISTORIAL</div>
          {completedMatches.map(m => {
            const isHome = m.home === myTeam, isAway = m.away === myTeam;
            const myG = isHome ? m.hs : m.as, oppG = isHome ? m.as : m.hs;
            const res = (isHome || isAway) ? (myG > oppG ? "W" : myG === oppG ? "D" : "L") : null;
            const resCol = res === "W" ? T.green : res === "D" ? T.yellow : T.red;
            return (
              <Card key={m.id} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                    <span style={{ fontSize: 10, color: T.muted }}>{m.date}</span>
                    {m.competition && <Badge label={m.competition} color={T.accent} />}
                  </div>
                  <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                    {res && (
                      <div style={{ width: 20, height: 20, borderRadius: "50%", background: resCol + "22", border: `1.5px solid ${resCol}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 8, fontWeight: 800, color: resCol }}>{res}</span>
                      </div>
                    )}
                    <Badge label="Final" color={T.green} />
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10 }}>
                  <div style={{ textAlign: "center", flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3, marginBottom: 2 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: m.hc || T.accent }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: T.text }}>{m.home}</span>
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 900, color: m.hs > m.as ? T.text : T.muted }}>{m.hs}</div>
                  </div>
                  <div style={{ fontSize: 10, color: T.muted }}>–</div>
                  <div style={{ textAlign: "center", flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3, marginBottom: 2 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: m.ac || T.muted }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: T.text }}>{m.away}</span>
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 900, color: m.as > m.hs ? T.text : T.muted }}>{m.as}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button onClick={() => onViewAnalysis(m)}
                    style={{ flex: 2, background: T.accent + "15", color: T.accent, border: `1px solid ${T.accent}33`, borderRadius: 8, padding: "6px", fontSize: 9, fontWeight: 700, cursor: "pointer" }}>
                    📊 Análisis
                  </button>
                  <button onClick={() => onViewEvolution(m)}
                    style={{ flex: 1, background: T.card2, color: T.muted, border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px", fontSize: 9, fontWeight: 600, cursor: "pointer" }}>
                    📈 Evo
                  </button>
                  <button onClick={() => onReopenMatch(m)}
                    style={{ flex: 1, background: T.yellow + "15", color: T.yellow, border: `1px solid ${T.yellow}33`, borderRadius: 8, padding: "6px", fontSize: 9, fontWeight: 600, cursor: "pointer" }}>
                    ✏️
                  </button>
                  <button onClick={() => { if (window.confirm(`¿Eliminar ${m.home} vs ${m.away}?`)) onDeleteMatch(m.id); }}
                    style={{ background: T.red + "15", color: T.red, border: `1px solid ${T.red}33`, borderRadius: 8, padding: "6px 9px", fontSize: 11, cursor: "pointer" }}>
                    🗑
                  </button>
                </div>
              </Card>
            );
          })}
        </>
      )}
    </div>
  );
}
