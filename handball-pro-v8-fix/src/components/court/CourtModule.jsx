/**
 * CourtModule — Módulo completo de cancha + arco.
 * Diseño basado en court.html.
 *
 * Module 1 (arriba): Arco 3×3 — 9 cuadrantes internos + zona errado (strip sobre el travesaño)
 * Module 2 (abajo):  Cancha SVG con 8 zonas + badge 7m
 *
 * Flujo:
 *  1. Usuario toca una zona de cancha
 *  2. Usuario toca una zona del arco
 *  3. Aparece overlay → Gol / Atajado / Errado
 *  4. Se llama onRegister({ zone, quadrant, type })
 *
 * Props:
 *  onRegister(ev)   — { zone: string, quadrant: number|null, type: "goal"|"saved"|"miss" }
 *  heatCounts       — { [zone_string]: count }   para heatmap de cancha
 *  byQuadrant       — [{ id, goals, total, ... }] para heatmap de arco
 *  activeTeam       — "home" | "away"
 *  homeTeam         — { name, color }
 *  awayTeam         — { name, color }
 *  onTeamChange     — (side) => void
 */

import { useState, useCallback } from "react";

// ── Mapeo numérico → string IDs de zona ──────────────────────
const ZONE_MAP = {
  1: "extreme_left",
  2: "lateral_left",
  3: "center_above",
  4: "lateral_right",
  5: "extreme_right",
  6: "7m",
  7: "near_left",
  8: "near_center",
  9: "near_right",
};

const ZONE_NAMES = {
  1: "Ext. Izq.", 2: "Lat. Izq.", 3: "Centro",
  4: "Lat. Der.", 5: "Ext. Der.", 6: "7m",
  7: "Cerca Izq.", 8: "Pivote", 9: "Cerca Der.",
};

const GOAL_ZONE_NAMES = {
  0:"Arr. Izq.", 1:"Arr. Centro", 2:"Arr. Der.",
  3:"Med. Izq.", 4:"Med. Centro", 5:"Med. Der.",
  6:"Abj. Izq.", 7:"Abj. Centro", 8:"Abj. Der.",
  9:"Fuera del arco",
};

// ── Colores de zona en cancha (heatmap) ──────────────────────
function courtZoneFill(zoneNum, selectedZone, heatCounts) {
  const key = ZONE_MAP[zoneNum];
  if (selectedZone === zoneNum) return "rgba(200,168,42,0.75)";
  const count = heatCounts?.[key] ?? 0;
  if (count > 0) {
    const maxV = Math.max(...Object.values(heatCounts || {}), 1);
    return `rgba(239,100,97,${0.15 + (count / maxV) * 0.5})`;
  }
  return "transparent";
}

// ── Colores de cuadrante en arco (heatmap) ───────────────────
function goalZoneFill(gz, selectedGoalZone, byQuadrant) {
  if (gz === 9) return selectedGoalZone === 9 ? "rgba(100,100,100,0.55)" : "rgba(0,0,0,0)";
  if (selectedGoalZone === gz) return "rgba(200,168,42,0.6)";
  const quad = byQuadrant?.find(q => q.id === gz);
  if (quad?.total > 0) {
    const maxT = Math.max(...(byQuadrant || []).map(q => q.total), 1);
    return `rgba(239,100,97,${0.12 + (quad.total / maxT) * 0.45})`;
  }
  return "rgba(255,255,255,0.03)";
}

// ── MODULE 1: Arco SVG ───────────────────────────────────────
function GoalSVG({ selectedGoalZone, onSelect, byQuadrant }) {
  const sel = (gz) => onSelect(selectedGoalZone === gz ? null : gz);

  // 9 inner zones: 3 cols × 3 rows
  const zones = [
    { gz:0, x:6,   y:9,  w:101, h:43 },
    { gz:1, x:111, y:9,  w:98,  h:43 },
    { gz:2, x:213, y:9,  w:101, h:43 },
    { gz:3, x:6,   y:54, w:101, h:43 },
    { gz:4, x:111, y:54, w:98,  h:43 },
    { gz:5, x:213, y:54, w:101, h:43 },
    { gz:6, x:6,   y:99, w:101, h:41 },
    { gz:7, x:111, y:99, w:98,  h:41 },
    { gz:8, x:213, y:99, w:101, h:41 },
  ];

  return (
    <svg
      viewBox="0 0 320 140"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", display: "block" }}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Errado zone: above crossbar */}
      <rect
        data-gz="9"
        onClick={() => sel(9)}
        x="0" y="0" width="320" height="8"
        fill={goalZoneFill(9, selectedGoalZone, byQuadrant)}
        style={{ cursor: "pointer" }}
      />

      {/* Goal interior */}
      <rect x="5" y="8" width="310" height="132" fill="#0d2240" />

      {/* Grid lines */}
      <line x1="5"   y1="52"  x2="315" y2="52"  stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
      <line x1="5"   y1="98"  x2="315" y2="98"  stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
      <line x1="109" y1="8"   x2="109" y2="140" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
      <line x1="211" y1="8"   x2="211" y2="140" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
      {/* Fine net texture */}
      <line x1="55"  y1="8"   x2="55"  y2="140" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      <line x1="160" y1="8"   x2="160" y2="140" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      <line x1="265" y1="8"   x2="265" y2="140" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      <line x1="5"   y1="30"  x2="315" y2="30"  stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      <line x1="5"   y1="75"  x2="315" y2="75"  stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      <line x1="5"   y1="120" x2="315" y2="120" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

      {/* 9 inner zones */}
      {zones.map(({ gz, x, y, w, h }) => {
        const quad = byQuadrant?.find(q => q.id === gz);
        return (
          <g key={gz} onClick={() => sel(gz)} style={{ cursor: "pointer" }}>
            <rect
              x={x} y={y} width={w} height={h} rx="2"
              fill={goalZoneFill(gz, selectedGoalZone, byQuadrant)}
              stroke={selectedGoalZone === gz ? "#c8a82a" : "rgba(255,255,255,0.15)"}
              strokeWidth={selectedGoalZone === gz ? 2 : 1}
            />
            {quad?.total > 0 && (
              <text
                x={x + w / 2} y={y + h / 2 + 5}
                textAnchor="middle" fill="#fff"
                fontSize="13" fontWeight="bold"
                fontFamily="Arial,sans-serif"
                style={{ pointerEvents: "none" }}
              >
                {quad.total}
              </text>
            )}
          </g>
        );
      })}

      {/* Goal frame — crossbar + posts (no bottom bar) */}
      <line x1="0"   y1="8" x2="320" y2="8"   stroke="#e8453c" strokeWidth="7" strokeLinecap="round" />
      <line x1="5"   y1="8" x2="5"   y2="140" stroke="#e8453c" strokeWidth="7" strokeLinecap="round" />
      <line x1="315" y1="8" x2="315" y2="140" stroke="#e8453c" strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
}

// ── MODULE 2: Cancha SVG ─────────────────────────────────────
function CourtSVG({ selectedCourtZone, onSelect, heatCounts }) {
  const sel = (z) => onSelect(selectedCourtZone === z ? null : z);
  const f   = (z) => courtZoneFill(z, selectedCourtZone, heatCounts);

  return (
    <svg
      viewBox="0 0 360 300"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      <defs>
        <clipPath id="cm-aL"><path d="M 65 0 L 148 0 L 148 174 Q 106 158 65 132 Z"/></clipPath>
        <clipPath id="cm-aC"><path d="M 148 0 L 212 0 L 212 174 L 148 174 Z"/></clipPath>
        <clipPath id="cm-aR"><path d="M 212 0 L 295 0 L 295 132 Q 254 158 212 174 Z"/></clipPath>
        <clipPath id="cm-bL"><path d="M 65 132 Q 106 158 148 174 L 148 300 L 65 300 Z"/></clipPath>
        <clipPath id="cm-bC"><path d="M 148 174 L 212 174 L 212 300 L 148 300 Z"/></clipPath>
        <clipPath id="cm-bR"><path d="M 212 174 Q 254 158 295 132 L 295 300 L 212 300 Z"/></clipPath>
      </defs>

      {/* Background */}
      <rect width="360" height="300" fill="#0b1a2e" />

      {/* Zone 1 – Ext. Izq. */}
      <rect onClick={() => sel(1)} style={{ cursor: "pointer" }}
        x="0" y="0" width="65" height="117"
        fill={f(1)} stroke={selectedCourtZone===1 ? "#c8a82a" : "transparent"} strokeWidth="2" />

      {/* Zone 2 – Lat. Izq. (above 9m) */}
      <rect onClick={() => sel(2)} style={{ cursor: "pointer" }}
        x="65" y="0" width="83" height="300" clipPath="url(#cm-aL)"
        fill={f(2)} stroke={selectedCourtZone===2 ? "#c8a82a" : "transparent"} strokeWidth="2" />

      {/* Zone 3 – Centro (above 9m) */}
      <rect onClick={() => sel(3)} style={{ cursor: "pointer" }}
        x="148" y="0" width="64" height="300" clipPath="url(#cm-aC)"
        fill={f(3)} stroke={selectedCourtZone===3 ? "#c8a82a" : "transparent"} strokeWidth="2" />

      {/* Zone 4 – Lat. Der. (above 9m) */}
      <rect onClick={() => sel(4)} style={{ cursor: "pointer" }}
        x="212" y="0" width="83" height="300" clipPath="url(#cm-aR)"
        fill={f(4)} stroke={selectedCourtZone===4 ? "#c8a82a" : "transparent"} strokeWidth="2" />

      {/* Zone 5 – Ext. Der. */}
      <rect onClick={() => sel(5)} style={{ cursor: "pointer" }}
        x="295" y="0" width="65" height="117"
        fill={f(5)} stroke={selectedCourtZone===5 ? "#c8a82a" : "transparent"} strokeWidth="2" />

      {/* Zone 7 – Cerca Izq. (below 9m) */}
      <rect onClick={() => sel(7)} style={{ cursor: "pointer" }}
        x="65" y="0" width="83" height="300" clipPath="url(#cm-bL)"
        fill={f(7)} stroke={selectedCourtZone===7 ? "#c8a82a" : "transparent"} strokeWidth="2" />

      {/* Zone 8 – Pivote (below 9m) */}
      <rect onClick={() => sel(8)} style={{ cursor: "pointer" }}
        x="148" y="0" width="64" height="300" clipPath="url(#cm-bC)"
        fill={f(8)} stroke={selectedCourtZone===8 ? "#c8a82a" : "transparent"} strokeWidth="2" />

      {/* Zone 9 – Cerca Der. (below 9m) */}
      <rect onClick={() => sel(9)} style={{ cursor: "pointer" }}
        x="212" y="0" width="83" height="300" clipPath="url(#cm-bR)"
        fill={f(9)} stroke={selectedCourtZone===9 ? "#c8a82a" : "transparent"} strokeWidth="2" />

      {/* Court lines */}
      <path d="M 0 0 Q 180 210 360 0 L 360 -2 L 0 -2 Z" fill="#1a3d7a" opacity="0.9" />
      <path d="M 0 0 Q 180 210 360 0" fill="none" stroke="#ffffff" strokeWidth="2.5" />
      <path d="M 0 65 Q 180 290 360 65" fill="none" stroke="#ffffff" strokeWidth="2" strokeDasharray="10,7" />

      {/* Vertical dividers */}
      <line x1="65"  y1="62"  x2="65"  y2="300" stroke="#ffffff" strokeWidth="1.5" opacity="0.45" />
      <line x1="148" y1="102" x2="148" y2="300" stroke="#ffffff" strokeWidth="1.5" opacity="0.45" />
      <line x1="212" y1="102" x2="212" y2="300" stroke="#ffffff" strokeWidth="1.5" opacity="0.45" />
      <line x1="295" y1="62"  x2="295" y2="300" stroke="#ffffff" strokeWidth="1.5" opacity="0.45" />

      {/* Heatmap counts on court */}
      {Object.entries({
        1: { x: 32,  y: 80  },
        2: { x: 106, y: 80  },
        3: { x: 180, y: 65  },
        4: { x: 254, y: 80  },
        5: { x: 328, y: 80  },
        7: { x: 106, y: 210 },
        8: { x: 180, y: 240 },
        9: { x: 254, y: 210 },
      }).map(([z, { x, y }]) => {
        const key = ZONE_MAP[parseInt(z)];
        const v = heatCounts?.[key];
        if (!v) return null;
        return (
          <text key={z} x={x} y={y} textAnchor="middle"
            fill="#fff" fontSize="16" fontWeight="bold"
            fontFamily="Arial,sans-serif" style={{ pointerEvents: "none" }}>
            {v}
          </text>
        );
      })}

      {/* 7m badge */}
      <g onClick={() => sel(6)} style={{ cursor: "pointer" }}>
        <rect x="148" y="125" width="64" height="24" rx="12"
          fill={selectedCourtZone === 6 ? "#c8a82a" : "#ffffff"} />
        <text x="180" y="141" textAnchor="middle"
          fill={selectedCourtZone === 6 ? "#fff" : "#0b1a2e"}
          fontFamily="Arial,sans-serif" fontSize="12" fontWeight="800"
          style={{ pointerEvents: "none" }}>
          7m
        </text>
      </g>
    </svg>
  );
}

// ── RESULT OVERLAY ───────────────────────────────────────────
function ResultOverlay({ courtZone, goalZone, onConfirm, onCancel, activeTeam, homeTeam, awayTeam }) {
  if (courtZone === null || goalZone === null) return null;

  const isErrado = goalZone === 9;
  const zoneName = ZONE_NAMES[courtZone] ?? String(courtZone);
  const goalName = GOAL_ZONE_NAMES[goalZone] ?? String(goalZone);

  const teamName  = activeTeam === "home"
    ? (homeTeam?.short_name ?? homeTeam?.name ?? "Local")
    : (awayTeam?.short_name ?? awayTeam?.name ?? "Visitante");
  const teamColor = activeTeam === "home"
    ? (homeTeam?.color ?? "#ef6461")
    : (awayTeam?.color ?? "#48cae4");

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)",
        zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <div style={{
        background: "#132a4e", borderRadius: 16, padding: "20px 28px",
        display: "flex", flexDirection: "column", gap: 12, minWidth: 220,
        boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
      }}>
        {/* Team badge */}
        <div style={{
          textAlign: "center", fontSize: 11, fontWeight: 800, padding: "6px 12px",
          borderRadius: 8, background: teamColor + "33",
          color: teamColor, border: `1px solid ${teamColor}55`,
        }}>
          ⚡ {teamName}
        </div>

        {/* Zone info */}
        <p style={{ textAlign: "center", fontSize: 11, color: "#aaa", fontWeight: 600, margin: 0 }}>
          {zoneName} → {goalName}
        </p>

        {isErrado ? (
          <button
            onClick={() => onConfirm("miss")}
            style={{ padding: "14px", borderRadius: 10, border: "none", fontSize: 16,
              fontWeight: 800, cursor: "pointer", background: "#666", color: "#fff" }}
          >
            ✕ Errado / Fuera
          </button>
        ) : (
          <>
            <button
              onClick={() => onConfirm("goal")}
              style={{ padding: "14px", borderRadius: 10, border: "none", fontSize: 16,
                fontWeight: 800, cursor: "pointer", background: "#e8453c", color: "#fff" }}
            >
              ⚽ Gol
            </button>
            <button
              onClick={() => onConfirm("saved")}
              style={{ padding: "14px", borderRadius: 10, border: "none", fontSize: 16,
                fontWeight: 800, cursor: "pointer", background: "#2ecfb0", color: "#fff" }}
            >
              🧤 Atajado
            </button>
          </>
        )}

        <button
          onClick={onCancel}
          style={{ padding: "10px", borderRadius: 10, border: "none", fontSize: 13,
            fontWeight: 600, cursor: "pointer", background: "#1a3a60", color: "#aaa" }}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

// ── MAIN EXPORT ──────────────────────────────────────────────
export default function CourtModule({
  onRegister,
  heatCounts = {},
  byQuadrant = [],
  activeTeam = "home",
  homeTeam,
  awayTeam,
  onTeamChange,
}) {
  const [selectedCourtZone, setSelectedCourtZone] = useState(null);
  const [selectedGoalZone,  setSelectedGoalZone]  = useState(null);
  const showOverlay = selectedCourtZone !== null && selectedGoalZone !== null;

  const handleCourtSelect = useCallback((z) => {
    setSelectedCourtZone(prev => prev === z ? null : z);
  }, []);

  const handleGoalSelect = useCallback((gz) => {
    setSelectedGoalZone(prev => prev === gz ? null : gz);
  }, []);

  const handleConfirm = useCallback((type) => {
    const zone     = ZONE_MAP[selectedCourtZone] ?? String(selectedCourtZone);
    const quadrant = selectedGoalZone === 9 ? null : selectedGoalZone;
    onRegister?.({ zone, quadrant, type });
    setSelectedCourtZone(null);
    setSelectedGoalZone(null);
  }, [selectedCourtZone, selectedGoalZone, onRegister]);

  const handleCancel = useCallback(() => {
    setSelectedGoalZone(null);
  }, []);

  const homeName  = homeTeam?.short_name ?? homeTeam?.name  ?? "Local";
  const awayName  = awayTeam?.short_name ?? awayTeam?.name  ?? "Visitante";
  const homeColor = homeTeam?.color ?? "#ef6461";
  const awayColor = awayTeam?.color ?? "#48cae4";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>

      {/* ── Team selector ── */}
      {onTeamChange && (
        <div style={{
          display: "flex", gap: 6, alignItems: "center", marginBottom: 6,
        }}>
          <span style={{ fontSize: 9, color: "#666", textTransform: "uppercase", letterSpacing: 1.5, whiteSpace: "nowrap" }}>
            Ataca:
          </span>
          <button
            onClick={() => onTeamChange("home")}
            style={{
              flex: 1, padding: "6px 8px", borderRadius: 8, fontSize: 11, fontWeight: 800,
              cursor: "pointer", transition: "all .15s",
              background: activeTeam === "home" ? homeColor : "rgba(255,255,255,0.06)",
              color:      activeTeam === "home" ? "#fff"    : "#888",
              border: `1.5px solid ${activeTeam === "home" ? homeColor : "rgba(255,255,255,0.1)"}`,
            }}
          >
            {homeName}
          </button>
          <span style={{ fontSize: 9, color: "#555" }}>vs</span>
          <button
            onClick={() => onTeamChange("away")}
            style={{
              flex: 1, padding: "6px 8px", borderRadius: 8, fontSize: 11, fontWeight: 800,
              cursor: "pointer", transition: "all .15s",
              background: activeTeam === "away" ? awayColor : "rgba(255,255,255,0.06)",
              color:      activeTeam === "away" ? "#fff"    : "#888",
              border: `1.5px solid ${activeTeam === "away" ? awayColor : "rgba(255,255,255,0.1)"}`,
            }}
          >
            {awayName}
          </button>
        </div>
      )}

      {/* ── Module 1: Goal grid ── */}
      <div style={{
        background: "#0a1e3a", borderRadius: "12px 12px 0 0",
        padding: "8px 12px 4px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ fontSize: 8, color: "#555", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>
          Sección del arco
        </div>
        <GoalSVG
          selectedGoalZone={selectedGoalZone}
          onSelect={handleGoalSelect}
          byQuadrant={byQuadrant}
        />
      </div>

      {/* ── Module 2: Court ── */}
      <div style={{
        background: "#0b1a2e", borderRadius: "0 0 12px 12px",
        padding: "4px 12px 10px",
        border: "1px solid rgba(255,255,255,0.06)",
        borderTop: "none",
      }}>
        <div style={{ fontSize: 8, color: "#555", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>
          Zona de tiro
        </div>
        <div style={{ height: 200 }}>
          <CourtSVG
            selectedCourtZone={selectedCourtZone}
            onSelect={handleCourtSelect}
            heatCounts={heatCounts}
          />
        </div>
      </div>

      {/* ── Overlay ── */}
      {showOverlay && (
        <ResultOverlay
          courtZone={selectedCourtZone}
          goalZone={selectedGoalZone}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          activeTeam={activeTeam}
          homeTeam={homeTeam}
          awayTeam={awayTeam}
        />
      )}
    </div>
  );
}
