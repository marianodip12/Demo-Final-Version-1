import { useState } from "react";
import { T, ZONES } from "../utils/constants.js";

export function Heatmap({ events = [], title = "Heatmap de tiros" }) {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? events : events.filter(e => e.type === filter);
  const heatCounts = {};
  filtered.filter(e => e.zone).forEach(e => {
    heatCounts[e.zone] = (heatCounts[e.zone] || 0) + 1;
  });
  const maxV = Math.max(...Object.values(heatCounts), 1);

  const heatFill = k => {
    const v = heatCounts[k] || 0;
    if (!v) return "rgba(255,255,255,0.04)";
    const ratio = v / maxV;
    if (filter === "goal" || (filter === "all" && false)) return `rgba(34,197,94,${0.15 + ratio * 0.6})`;
    if (filter === "saved") return `rgba(96,165,250,${0.15 + ratio * 0.6})`;
    if (filter === "miss")  return `rgba(239,68,68,${0.15 + ratio * 0.6})`;
    return `rgba(59,130,246,${0.15 + ratio * 0.5})`;
  };

  const FILTERS = [
    { k: "all",   l: "Todo",       c: T.accent },
    { k: "goal",  l: "⚽ Goles",   c: T.green },
    { k: "saved", l: "🧤 Atajadas",c: "#60a5fa" },
    { k: "miss",  l: "❌ Errados", c: T.red },
  ];

  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 8 }}>{title}</div>
      <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
        {FILTERS.map(f => (
          <button key={f.k} onClick={() => setFilter(f.k)}
            style={{
              flex: 1, background: filter === f.k ? f.c + "28" : T.card,
              color: filter === f.k ? f.c : T.muted,
              border: `1px solid ${filter === f.k ? f.c : T.border}`,
              borderRadius: 8, padding: "6px 4px", fontSize: 10, fontWeight: 700, cursor: "pointer",
            }}>
            {f.l}
          </button>
        ))}
      </div>

      <div style={{ background: "#0f2a5a", borderRadius: 14, padding: "10px 6px", border: "1px solid #1e407a" }}>
        <svg viewBox="-8 -28 296 190" width="100%" preserveAspectRatio="xMidYMid meet" style={{ display: "block", maxWidth: 400, margin: "0 auto" }}>
          <rect x="-8" y="-28" width="296" height="190" fill="#0f2a5a" rx="8" />
          <rect x="0" y="0" width="280" height="155" fill="#2196c4" rx="4" />
          <path d="M 56 0 A 84 84 0 0 1 224 0 Z" fill="#1565a0" />
          {Object.entries(ZONES).map(([key, zone]) => (
            <path key={key} d={zone.path}
              fill={heatFill(key)}
              stroke="rgba(255,255,255,.2)"
              strokeWidth="1"
              style={{ transition: "fill .2s" }}
            />
          ))}
          {Object.entries(ZONES).map(([key, zone]) => (
            <g key={key + "label"}>
              <text x={zone.lx} y={zone.ly - 4} textAnchor="middle"
                style={{ fontSize: 10, fill: "rgba(255,255,255,.8)", fontWeight: 700, pointerEvents: "none", userSelect: "none" }}>
                {zone.short}
              </text>
              {heatCounts[key] > 0 && (
                <text x={zone.lx} y={zone.ly + 8} textAnchor="middle"
                  style={{ fontSize: 9, fill: "rgba(255,255,255,.9)", fontWeight: 900, pointerEvents: "none" }}>
                  {heatCounts[key]}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* Zone breakdown */}
      <div style={{ marginTop: 10 }}>
        {Object.entries(ZONES)
          .map(([k, z]) => ({ key: k, zone: z, count: heatCounts[k] || 0 }))
          .filter(x => x.count > 0)
          .sort((a, b) => b.count - a.count)
          .map(x => {
            const pct = Math.round(x.count / filtered.length * 100);
            return (
              <div key={x.key} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: x.zone.color, width: 80, flexShrink: 0 }}>{x.zone.label}</span>
                <div style={{ flex: 1, height: 7, background: T.border, borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: x.zone.color + "bb", borderRadius: 4 }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: T.text, width: 20, textAlign: "right" }}>{x.count}</span>
              </div>
            );
          })}
      </div>
    </div>
  );
}
