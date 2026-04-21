/**
 * Heatmap — Vista de análisis de zonas de tiro.
 * Usa las mismas zonas que CourtModule (extreme_left, lateral_left, etc.)
 * SVG idéntico al módulo de registro pero sin interactividad.
 */
import { useState } from "react";
import { T } from "../utils/constants.js";

// ── Zonas nuevas ──────────────────────────────────────────────
const ZONES_NEW = {
  extreme_left:  { label: "Extremo Izq.",  short: "EI", color: "#06b6d4" },
  lateral_left:  { label: "Lateral Izq.",  short: "LI", color: "#8b5cf6" },
  center_above:  { label: "Centro",        short: "CE", color: "#f59e0b" },
  lateral_right: { label: "Lateral Der.",  short: "LD", color: "#8b5cf6" },
  extreme_right: { label: "Extremo Der.",  short: "ED", color: "#06b6d4" },
  near_left:     { label: "Cerca Izq.",    short: "CI", color: "#ef4444" },
  near_center:   { label: "Pivote",        short: "PI", color: "#ef4444" },
  near_right:    { label: "Cerca Der.",    short: "CD", color: "#ef4444" },
  "7m":          { label: "7 metros",      short: "7m", color: "#fff" },
};

// Map numeric (court.html compat) → string
const NUM_MAP = {
  1:"extreme_left", 2:"lateral_left",  3:"center_above",
  4:"lateral_right",5:"extreme_right", 7:"near_left",
  8:"near_center",  9:"near_right",    6:"7m",
};

// Normalize zone key (string or number → string)
function normalizeZone(z) {
  if (typeof z === "number") return NUM_MAP[z] || null;
  return z;
}

// Fill color for heatmap
function heatFill(key, counts, maxV, filter) {
  const v = counts[key] || 0;
  if (!v) return "rgba(255,255,255,0.04)";
  const r = v / maxV;
  if (filter === "goal")  return `rgba(34,197,94,${0.18 + r * 0.58})`;
  if (filter === "saved") return `rgba(96,165,250,${0.18 + r * 0.58})`;
  if (filter === "miss" || filter === "post") return `rgba(239,68,68,${0.18 + r * 0.58})`;
  return `rgba(59,130,246,${0.18 + r * 0.48})`;
}

export function Heatmap({ events = [], title = "Heatmap de tiros" }) {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all"
    ? events
    : events.filter(e => filter === "miss" ? ["miss","post"].includes(e.type) : e.type === filter);

  // Build normalized counts
  const counts = {};
  filtered.forEach(e => {
    const key = normalizeZone(e.zone);
    if (key && ZONES_NEW[key]) counts[key] = (counts[key] || 0) + 1;
  });
  const maxV = Math.max(...Object.values(counts), 1);

  const FILTERS = [
    { k: "all",   l: "Todo",        c: T.accent },
    { k: "goal",  l: "⚽ Goles",    c: T.green  },
    { k: "saved", l: "🧤 Atajadas", c: "#60a5fa" },
    { k: "miss",  l: "✕ Errados",  c: T.red    },
  ];

  // Zone positions for labels/counts in the court SVG (viewBox 0 0 360 300)
  const ZONE_POS = {
    extreme_left:  { x: 32,  y: 80,  lx: 32,  ly: 50  },
    lateral_left:  { x: 106, y: 80,  lx: 106, ly: 50  },
    center_above:  { x: 180, y: 65,  lx: 180, ly: 40  },
    lateral_right: { x: 254, y: 80,  lx: 254, ly: 50  },
    extreme_right: { x: 328, y: 80,  lx: 328, ly: 50  },
    near_left:     { x: 106, y: 220, lx: 106, ly: 195 },
    near_center:   { x: 180, y: 245, lx: 180, ly: 220 },
    near_right:    { x: 254, y: 220, lx: 254, ly: 195 },
    "7m":          { x: 180, y: 145, lx: 180, ly: 145 },
  };

  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 8 }}>{title}</div>

      {/* Filter buttons */}
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

      {/* Court SVG — same design as CourtModule */}
      <div style={{ background: "#0b1a2e", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)" }}>
        <svg viewBox="0 0 360 300" width="100%" preserveAspectRatio="xMidYMid meet"
          style={{ display: "block" }}>
          <defs>
            <clipPath id="ha-aL"><path d="M 65 0 L 148 0 L 148 174 Q 106 158 65 132 Z"/></clipPath>
            <clipPath id="ha-aC"><path d="M 148 0 L 212 0 L 212 174 L 148 174 Z"/></clipPath>
            <clipPath id="ha-aR"><path d="M 212 0 L 295 0 L 295 132 Q 254 158 212 174 Z"/></clipPath>
            <clipPath id="ha-bL"><path d="M 65 132 Q 106 158 148 174 L 148 300 L 65 300 Z"/></clipPath>
            <clipPath id="ha-bC"><path d="M 148 174 L 212 174 L 212 300 L 148 300 Z"/></clipPath>
            <clipPath id="ha-bR"><path d="M 212 174 Q 254 158 295 132 L 295 300 L 212 300 Z"/></clipPath>
          </defs>

          <rect width="360" height="300" fill="#0b1a2e"/>

          {/* Zone fills */}
          <rect x="0"   y="0" width="65"  height="117" fill={heatFill("extreme_left",  counts, maxV, filter)}/>
          <rect x="65"  y="0" width="83"  height="300" clipPath="url(#ha-aL)" fill={heatFill("lateral_left",  counts, maxV, filter)}/>
          <rect x="148" y="0" width="64"  height="300" clipPath="url(#ha-aC)" fill={heatFill("center_above",  counts, maxV, filter)}/>
          <rect x="212" y="0" width="83"  height="300" clipPath="url(#ha-aR)" fill={heatFill("lateral_right", counts, maxV, filter)}/>
          <rect x="295" y="0" width="65"  height="117" fill={heatFill("extreme_right", counts, maxV, filter)}/>
          <rect x="65"  y="0" width="83"  height="300" clipPath="url(#ha-bL)" fill={heatFill("near_left",     counts, maxV, filter)}/>
          <rect x="148" y="0" width="64"  height="300" clipPath="url(#ha-bC)" fill={heatFill("near_center",   counts, maxV, filter)}/>
          <rect x="212" y="0" width="83"  height="300" clipPath="url(#ha-bR)" fill={heatFill("near_right",    counts, maxV, filter)}/>

          {/* Court lines */}
          <path d="M 0 0 Q 180 210 360 0 L 360 -2 L 0 -2 Z" fill="#1a3d7a" opacity="0.9"/>
          <path d="M 0 0 Q 180 210 360 0" fill="none" stroke="#fff" strokeWidth="2.5"/>
          <path d="M 0 65 Q 180 290 360 65" fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="10,7"/>
          <line x1="65"  y1="62"  x2="65"  y2="300" stroke="#fff" strokeWidth="1.5" opacity="0.45"/>
          <line x1="148" y1="102" x2="148" y2="300" stroke="#fff" strokeWidth="1.5" opacity="0.45"/>
          <line x1="212" y1="102" x2="212" y2="300" stroke="#fff" strokeWidth="1.5" opacity="0.45"/>
          <line x1="295" y1="62"  x2="295" y2="300" stroke="#fff" strokeWidth="1.5" opacity="0.45"/>

          {/* Zone labels & counts */}
          {Object.entries(ZONE_POS).map(([key, pos]) => {
            if (key === "7m") return null; // handled separately
            const v = counts[key];
            const short = ZONES_NEW[key]?.short ?? key;
            return (
              <g key={key}>
                <text x={pos.lx} y={pos.ly} textAnchor="middle"
                  fill="rgba(255,255,255,0.45)" fontSize="9" fontWeight="700"
                  fontFamily="Arial,sans-serif" style={{ pointerEvents: "none" }}>
                  {short}
                </text>
                {v > 0 && (
                  <text x={pos.x} y={pos.y} textAnchor="middle"
                    fill="#fff" fontSize="16" fontWeight="900"
                    fontFamily="Arial,sans-serif" style={{ pointerEvents: "none" }}>
                    {v}
                  </text>
                )}
              </g>
            );
          })}

          {/* 7m badge */}
          <rect x="148" y="125" width="64" height="24" rx="12" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
          <text x="180" y="141" textAnchor="middle" fill="#fff"
            fontFamily="Arial,sans-serif" fontSize="11" fontWeight="800"
            style={{ pointerEvents: "none" }}>
            7m {counts["7m"] ? `(${counts["7m"]})` : ""}
          </text>
        </svg>
      </div>

      {/* Zone breakdown bars */}
      {Object.keys(counts).length > 0 && (
        <div style={{ marginTop: 10 }}>
          {Object.entries(ZONES_NEW)
            .map(([k, z]) => ({ key: k, zone: z, count: counts[k] || 0 }))
            .filter(x => x.count > 0)
            .sort((a, b) => b.count - a.count)
            .map(x => {
              const pct = filtered.length ? Math.round(x.count / filtered.length * 100) : 0;
              return (
                <div key={x.key} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: x.zone.color, width: 84, flexShrink: 0 }}>
                    {x.zone.label}
                  </span>
                  <div style={{ flex: 1, height: 7, background: T.border, borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: x.zone.color + "bb", borderRadius: 4 }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: T.text, width: 20, textAlign: "right" }}>
                    {x.count}
                  </span>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
