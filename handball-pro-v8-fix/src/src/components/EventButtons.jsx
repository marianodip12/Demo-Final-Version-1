import { T, EV_TYPES } from "../utils/constants.js";

export function EventButtons({ onQuickTap, homeTeamName, awayTeamName, homeColor, awayColor, onMoreEvent }) {
  const QUICK_ACTIONS = [
    { type: "goal",      team: "home", label: "⚽ Gol",      color: T.green,   big: true },
    { type: "miss",      team: "home", label: "❌ Errado",    color: T.muted,   big: false },
    { type: "saved",     team: "away", label: "🧤 Atajada",   color: "#60a5fa", big: false },
    { type: "turnover",  team: "home", label: "🔄 Pérdida",   color: T.yellow,  big: false },
    { type: "exclusion", team: "home", label: "⏱ Exclusión",  color: T.orange,  big: false },
    { type: "goal",      team: "away", label: "🥅 Gol rival", color: T.red,     big: false },
  ];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 8 }}>
        {QUICK_ACTIONS.map((a, i) => (
          <button
            key={i}
            onClick={() => onQuickTap(a.type, a.team)}
            style={{
              background: a.big ? a.color + "28" : T.card,
              border: `1.5px solid ${a.big ? a.color : T.border}`,
              borderRadius: 12,
              padding: a.big ? "16px 8px" : "12px 6px",
              color: a.color,
              fontWeight: 700,
              fontSize: a.big ? 13 : 11,
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              transition: "all .1s",
              gridColumn: a.big && i === 0 ? "span 2" : "span 1",
            }}>
            <span style={{ fontSize: a.big ? 22 : 18 }}>{a.label.split(" ")[0]}</span>
            <span>{a.label.split(" ").slice(1).join(" ")}</span>
          </button>
        ))}
      </div>

      <button
        onClick={onMoreEvent}
        style={{
          width: "100%",
          background: T.card2,
          border: `1px solid ${T.border}`,
          borderRadius: 12,
          padding: "11px",
          color: T.muted,
          fontSize: 12,
          fontWeight: 700,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}>
        <span style={{ fontSize: 16 }}>+</span>
        Más eventos (tarjeta, tiempo muerto, descanso…)
      </button>
    </div>
  );
}
