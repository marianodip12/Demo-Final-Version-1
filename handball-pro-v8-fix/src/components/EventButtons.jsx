import { T } from "../utils/constants.js";

/**
 * EventButtons — modo rápido con selector de equipo
 * · Quita "Gol rival" — todo se registra desde el toggle home/away
 * · Atajada: la hace el arquero del equipo contrario al que ataca
 */
export function EventButtons({
  onQuickTap, homeTeamName, awayTeamName,
  homeColor, awayColor, onMoreEvent,
  activeTeam, onToggleTeam,
}) {
  const isHome  = activeTeam === "home";
  const teamName  = isHome ? homeTeamName : awayTeamName;
  const gkName    = isHome ? awayTeamName : homeTeamName;

  const tap     = (type) => onQuickTap(type, activeTeam);
  const press   = (e) => { e.currentTarget.style.transform = "scale(.93)"; };
  const release = (e) => { e.currentTarget.style.transform = "scale(1)"; };

  return (
    <div>
      {/* Team toggle */}
      <div style={{
        display: "flex", gap: 4, marginBottom: 10,
        background: T.card, borderRadius: 12, padding: 4,
        border: `1px solid ${T.border}`,
      }}>
        {[
          { k: "home", label: homeTeamName, color: homeColor },
          { k: "away", label: awayTeamName, color: awayColor },
        ].map(t => (
          <button key={t.k} onClick={() => onToggleTeam(t.k)} style={{
            flex: 1,
            background: activeTeam === t.k ? t.color + "22" : "transparent",
            color: activeTeam === t.k ? t.color : T.muted,
            border: `1.5px solid ${activeTeam === t.k ? t.color : "transparent"}`,
            borderRadius: 9, padding: "9px 6px", fontWeight: 800, fontSize: 12,
            cursor: "pointer", transition: "all .15s",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: activeTeam === t.k ? t.color : T.muted }} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Action grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 8 }}>
        {/* GOL — 2 cols */}
        <button onClick={() => tap("goal")}
          onTouchStart={press} onTouchEnd={release} onMouseDown={press} onMouseUp={release}
          style={{ gridColumn: "span 2", background: T.green + "28", border: `2px solid ${T.green}`, borderRadius: 14, padding: "18px 8px", color: T.green, fontWeight: 800, fontSize: 14, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 5, transition: "transform .1s", WebkitTapHighlightColor: "transparent" }}>
          <span style={{ fontSize: 26 }}>⚽</span>
          <span>Gol</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: T.green + "bb", marginTop: -2 }}>{teamName}</span>
        </button>

        {/* ERRADO */}
        <button onClick={() => tap("miss")}
          onTouchStart={press} onTouchEnd={release} onMouseDown={press} onMouseUp={release}
          style={{ ...btnStyle(T.muted) }}>
          <span style={{ fontSize: 20 }}>❌</span><span>Errado</span>
        </button>

        {/* ATAJADA — arquero rival */}
        <button onClick={() => tap("saved")}
          onTouchStart={press} onTouchEnd={release} onMouseDown={press} onMouseUp={release}
          style={{ ...btnStyle("#60a5fa") }}>
          <span style={{ fontSize: 20 }}>🧤</span>
          <span>Atajada</span>
          <span style={{ fontSize: 8, color: "#60a5fa99", marginTop: -2 }}>arq. {gkName}</span>
        </button>

        {/* PÉRDIDA */}
        <button onClick={() => tap("turnover")}
          onTouchStart={press} onTouchEnd={release} onMouseDown={press} onMouseUp={release}
          style={{ ...btnStyle(T.yellow) }}>
          <span style={{ fontSize: 20 }}>🔄</span><span>Pérdida</span>
        </button>

        {/* EXCLUSIÓN */}
        <button onClick={() => tap("exclusion")}
          onTouchStart={press} onTouchEnd={release} onMouseDown={press} onMouseUp={release}
          style={{ ...btnStyle(T.orange) }}>
          <span style={{ fontSize: 20 }}>⏱</span><span>Exclusión</span>
        </button>
      </div>

      {/* More */}
      <button onClick={onMoreEvent} style={{ width: "100%", background: T.card2, border: `1px solid ${T.border}`, borderRadius: 12, padding: "11px", color: T.muted, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <span style={{ fontSize: 16 }}>+</span>
        Más eventos (tarjeta, tiempo muerto, descanso…)
      </button>
    </div>
  );
}

const btnStyle = (color) => ({
  background: T.card, border: `1.5px solid ${T.border}`, borderRadius: 12,
  padding: "12px 6px", color, fontWeight: 700, fontSize: 11, cursor: "pointer",
  display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
  transition: "transform .1s", WebkitTapHighlightColor: "transparent",
});
