import { T } from "../utils/constants.js";
import { fmtTime } from "../utils/calculations.js";

export function ScoreBar({
  homeTeam, awayName, score,
  timerSecs, timerRunning, half,
  onToggleTimer, onStartHalf,
  exclusions = [], onRemoveExclusion,
}) {
  const homeC = homeTeam?.color || T.accent;
  const awayC = "#64748b";

  return (
    <div style={{ marginBottom: 10 }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
      <div style={{
        background: `linear-gradient(135deg,${homeC}18,${awayC}18)`,
        borderRadius: 14, padding: "10px 14px",
        border: `1px solid ${T.border}`, marginBottom: 6,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: homeC, marginBottom: 2 }}>{homeTeam?.name || "Local"}</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: homeC, lineHeight: 1 }}>{score.h}</div>
        </div>
        <div style={{ textAlign: "center", padding: "0 10px" }}>
          <div style={{
            fontSize: 20, fontWeight: 900, lineHeight: 1, marginBottom: 4, letterSpacing: 1,
            color: timerSecs === 0 ? T.red : timerRunning ? T.green : T.yellow,
          }}>
            {fmtTime(timerSecs)}
          </div>
          <div style={{ display: "flex", gap: 4, justifyContent: "center", marginBottom: 4 }}>
            <button onClick={onToggleTimer}
              style={{
                background: timerRunning ? "rgba(239,68,68,.2)" : "rgba(34,197,94,.2)",
                border: `1px solid ${timerRunning ? T.red : T.green}`,
                color: timerRunning ? T.red : T.green,
                borderRadius: 7, padding: "3px 8px", fontSize: 11, cursor: "pointer", fontWeight: 700,
              }}>
              {timerRunning ? "⏸" : "▶"}
            </button>
            {[1, 2].map(h => (
              <button key={h} onClick={() => onStartHalf(h)}
                style={{
                  background: half === h ? T.accent + "22" : "transparent",
                  color: half === h ? T.accent : T.muted,
                  border: `1px solid ${half === h ? T.accent : T.border}`,
                  borderRadius: 7, padding: "3px 7px", fontSize: 10, cursor: "pointer", fontWeight: 700,
                }}>
                {h}T
              </button>
            ))}
          </div>
          <div style={{ color: T.muted, fontSize: 14, fontWeight: 700 }}>–</div>
        </div>
        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: awayC, marginBottom: 2 }}>{awayName || "Rival"}</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: awayC, lineHeight: 1 }}>{score.a}</div>
        </div>
      </div>

      {exclusions.length > 0 && (
        <div style={{ display: "flex", gap: 6, marginBottom: 2 }}>
          {exclusions.map(ex => (
            <div key={ex.id} style={{
              flex: 1, background: "rgba(249,115,22,.12)",
              border: "1px solid rgba(249,115,22,.4)",
              borderRadius: 9, padding: "5px 8px",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: ex.team === "home" ? homeC : awayC, flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: T.orange, fontWeight: 700, flex: 1 }}>
                {ex.team === "home" ? (homeTeam?.name || "Local") : (awayName || "Rival")}
                {ex.player ? ` #${ex.player}` : ""}
              </span>
              <span style={{ fontSize: 13, fontWeight: 900, color: ex.secs <= 30 ? T.red : T.orange }}>
                {fmtTime(ex.secs)}
              </span>
              <button onClick={() => onRemoveExclusion(ex.id)}
                style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 12, padding: 0 }}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
