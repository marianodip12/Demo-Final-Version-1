import { useState, useMemo } from "react";
import { T, ZONES, QUADRANTS, EV_TYPES, DISTANCES, SITUATIONS, THROW_TYPES } from "../utils/constants.js";

// ─── ATOMS ───────────────────────────────────────────────

export function Btn({ onClick, children, color, outline, style = {}, disabled = false }) {
  const bg = outline ? "transparent" : color || T.accent;
  const border = outline ? `1px solid ${color || T.accent}` : "none";
  return (
    <button onClick={onClick} disabled={disabled}
      style={{
        background: disabled ? "#1a2d4a" : bg,
        color: disabled ? T.muted : "#fff",
        border: disabled ? "1px solid #1a2d4a" : border,
        borderRadius: 12, padding: "13px 16px", fontWeight: 700, fontSize: 13,
        cursor: disabled ? "not-allowed" : "pointer", width: "100%", ...style,
      }}>
      {children}
    </button>
  );
}

export function Card({ children, style = {} }) {
  return (
    <div style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.border}`, padding: "13px 14px", ...style }}>
      {children}
    </div>
  );
}

export function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 9, color: T.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 7, fontWeight: 700 }}>
      {children}
    </div>
  );
}

export function Badge({ label, color }) {
  return (
    <span style={{
      background: color + "22", color, border: `1px solid ${color}44`,
      borderRadius: 8, padding: "2px 8px", fontSize: 10, fontWeight: 700,
    }}>
      {label}
    </span>
  );
}

// ─── MODAL ───────────────────────────────────────────────

export function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.85)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 200,
    }}>
      <div style={{
        background: T.card, borderRadius: "20px 20px 0 0", border: `1px solid ${T.border}`,
        width: "100%", maxWidth: 430, maxHeight: "92vh", overflowY: "auto",
        padding: "16px 16px env(safe-area-inset-bottom,16px)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: T.text }}>{title}</span>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,.07)", border: "none", color: T.muted, borderRadius: 8, width: 28, height: 28, cursor: "pointer", fontSize: 14 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── QUADRANT PICKER ─────────────────────────────────────

export function QuadrantPicker({ value, onChange, resultColor }) {
  const rows = [[0, 1, 2], [3, 4, 5], [6, 7, 8]];
  return (
    <div>
      <SectionLabel>CUADRANTE DEL ARCO</SectionLabel>
      <div style={{ background: "#0c2340", borderRadius: 12, padding: 10, border: `1px solid ${T.border}` }}>
        <svg viewBox="0 0 100 40" width="100%" style={{ display: "block", marginBottom: 8 }}>
          <rect x="20" y="2" width="60" height="36" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="1.5" />
          <line x1="40" y1="2" x2="40" y2="38" stroke="rgba(255,255,255,.3)" strokeWidth=".8" />
          <line x1="60" y1="2" x2="60" y2="38" stroke="rgba(255,255,255,.3)" strokeWidth=".8" />
          <line x1="20" y1="15" x2="80" y2="15" stroke="rgba(255,255,255,.3)" strokeWidth=".8" />
          <line x1="20" y1="27" x2="80" y2="27" stroke="rgba(255,255,255,.3)" strokeWidth=".8" />
        </svg>
        {rows.map((row, ri) => (
          <div key={ri} style={{ display: "flex", gap: 5, marginBottom: ri < 2 ? 5 : 0 }}>
            {row.map(qi => {
              const q = QUADRANTS[qi];
              const sel = value === qi;
              return (
                <button key={qi} onClick={() => onChange(sel ? null : qi)}
                  style={{
                    flex: 1, background: sel ? (resultColor || T.accent) + "33" : "rgba(255,255,255,.05)",
                    border: `1.5px solid ${sel ? (resultColor || T.accent) : "rgba(255,255,255,.1)"}`,
                    borderRadius: 8, padding: "8px 4px", cursor: "pointer",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                  }}>
                  <span style={{ fontSize: 14, lineHeight: 1 }}>{q.icon}</span>
                  <span style={{ fontSize: 8, color: sel ? (resultColor || T.accent) : T.muted, fontWeight: 700 }}>{q.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PLAYER PICKER ───────────────────────────────────────

export function PlayerPicker({ players = [], value, onChange, label, accent }) {
  return (
    <div>
      <SectionLabel>{label}</SectionLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
        {players.map(p => (
          <button key={p.id || p.name} onClick={() => onChange(value === p.name ? null : p.name)}
            style={{
              background: value === p.name ? (accent || T.accent) + "22" : T.card2,
              color: value === p.name ? (accent || T.accent) : T.muted,
              border: `1.5px solid ${value === p.name ? (accent || T.accent) : T.border}`,
              borderRadius: 10, padding: "7px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 4,
            }}>
            <span style={{ background: (accent || T.accent) + "33", borderRadius: 5, padding: "1px 5px", fontSize: 10, fontWeight: 800 }}>
              #{p.number}
            </span>
            {p.name}
          </button>
        ))}
        {players.length === 0 && <span style={{ fontSize: 11, color: T.muted, padding: "6px 0" }}>Sin jugadores cargados</span>}
      </div>
    </div>
  );
}

// ─── MINI COURT ──────────────────────────────────────────

export function MiniCourt({ onZoneClick, selZone, heatCounts = {} }) {
  const [hov, setHov] = useState(null);
  const maxV = Math.max(...Object.values(heatCounts), 1);
  const heatFill = k => {
    const v = heatCounts[k] || 0;
    if (!v) return "rgba(255,255,255,0.04)";
    return `rgba(59,130,246,${0.15 + v / maxV * 0.5})`;
  };
  return (
    <div style={{ background: "#0f2a5a", borderRadius: 14, padding: "10px 6px", border: "1px solid #1e407a" }}>
      <svg viewBox="-8 -28 296 190" width="100%" preserveAspectRatio="xMidYMid meet" style={{ display: "block", maxWidth: 360, margin: "0 auto" }}>
        <rect x="-8" y="-28" width="296" height="190" fill="#0f2a5a" rx="8" />
        <rect x="0" y="0" width="280" height="155" fill="#2196c4" rx="4" />
        <path d="M 56 0 A 84 84 0 0 1 224 0 Z" fill="#1565a0" />
        {Object.entries(ZONES).map(([key, zone]) => (
          <path key={key} d={zone.path}
            fill={selZone === key ? zone.color + "55" : heatFill(key)}
            stroke={selZone === key ? "#fff" : hov === key ? "rgba(255,255,255,.55)" : "rgba(255,255,255,.15)"}
            strokeWidth={selZone === key ? 2.5 : hov === key ? 1.5 : 1}
            style={{ cursor: "pointer", transition: "all .15s" }}
            onMouseEnter={() => setHov(key)} onMouseLeave={() => setHov(null)}
            onClick={() => onZoneClick && onZoneClick(selZone === key ? null : key)}
          />
        ))}
        {Object.entries(ZONES).map(([key, zone]) => (
          <text key={key + "t"} x={zone.lx} y={zone.ly} textAnchor="middle"
            style={{ fontSize: 10, fill: "rgba(255,255,255,.7)", fontWeight: 700, pointerEvents: "none", userSelect: "none" }}>
            {zone.short}
          </text>
        ))}
      </svg>
    </div>
  );
}

// ─── SCORE CHART ─────────────────────────────────────────

export function ScoreChart({ events, homeColor, awayColor }) {
  const pts = useMemo(() => {
    const r = [{ min: 0, h: 0, a: 0 }];
    events.filter(e => e.hScore != null && e.type !== "half_time").forEach(e => r.push({ min: e.min, h: e.hScore, a: e.aScore }));
    return r;
  }, [events]);

  if (pts.length < 2) return (
    <div style={{ textAlign: "center", color: T.muted, fontSize: 11, padding: "20px 0" }}>Sin datos de marcador</div>
  );

  const maxG = Math.max(...pts.map(p => Math.max(p.h, p.a)), 5);
  const maxM = Math.max(...pts.map(p => p.min), 60);
  const W = 320, H = 90, PL = 24, PR = 8, PT = 8, PB = 16;
  const iW = W - PL - PR, iH = H - PT - PB;
  const xS = p => (p.min / maxM) * iW + PL;
  const yS = v => H - PB - ((v / maxG) * iH);
  const poly = arr => arr.map(p => `${xS(p)},${yS(p)}`).join(" ");
  const half = events.find(e => e.type === "half_time");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%">
      {[0, Math.round(maxG / 2), maxG].map(v => (
        <g key={v}>
          <line x1={PL} y1={yS(v)} x2={W - PR} y2={yS(v)} stroke={T.border} strokeWidth=".5" />
          <text x={PL - 3} y={yS(v) + 3} textAnchor="end" style={{ fontSize: 7, fill: T.muted }}>{v}</text>
        </g>
      ))}
      {half && <line x1={xS({ min: half.min })} y1={PT} x2={xS({ min: half.min })} y2={H - PB} stroke="#8b5cf6" strokeWidth="1" strokeDasharray="3,2" />}
      <polyline points={poly(pts)} fill="none" stroke={homeColor} strokeWidth="2" strokeLinejoin="round" />
      <polyline points={poly(pts.map(p => ({ ...p, h: p.a })))} fill="none" stroke={awayColor} strokeWidth="2" strokeLinejoin="round" />
      {pts.map((p, i) => i > 0 && p.h !== pts[i - 1].h && (
        <circle key={i + "h"} cx={xS(p)} cy={yS(p.h)} r="3" fill={homeColor} />
      ))}
      {pts.map((p, i) => i > 0 && p.a !== pts[i - 1].a && (
        <circle key={i + "a"} cx={xS(p)} cy={yS(p.a)} r="3" fill={awayColor} />
      ))}
    </svg>
  );
}

// ─── EVENT CARD ──────────────────────────────────────────

export function EventCard({ ev, homeColor, awayColor, homeName, awayName, onDelete }) {
  const [exp, setExp] = useState(false);
  const t  = EV_TYPES[ev.type] || { label: ev.type, icon: "•", color: T.muted };
  const tc = ev.team === "home" ? homeColor : awayColor;
  const tn = ev.team === "home" ? homeName : awayName;
  return (
    <div style={{
      background: T.card, borderRadius: 11, border: `1px solid ${T.border}`,
      borderLeft: `3px solid ${tc}`, padding: "9px 11px", marginBottom: 6,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 16, flexShrink: 0 }}>{t.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: tc }}>{tn}</span>
            <Badge label={t.label} color={t.color} />
            {ev.quickMode && !ev.completed && <Badge label="⚡" color={T.yellow} />}
            {ev.completed && <span style={{ fontSize: 11 }}>✅</span>}
          </div>
          <div style={{ fontSize: 10, color: T.muted, marginTop: 1 }}>
            {ev.min}' {ev.zone && `· ${ZONES[ev.zone]?.label}`} {ev.shooter && `· ${ev.shooter.name} #${ev.shooter.number}`}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
          {ev.type === "goal" && <span style={{ fontSize: 12, fontWeight: 900, color: T.green }}>{ev.hScore}–{ev.aScore}</span>}
          {onDelete && (
            <button onClick={() => onDelete(ev.id)}
              style={{ background: "rgba(239,68,68,.15)", border: "1px solid rgba(239,68,68,.3)", color: T.red, borderRadius: 7, padding: "3px 7px", fontSize: 11, cursor: "pointer", fontWeight: 700 }}>
              ✕
            </button>
          )}
          <button onClick={() => setExp(!exp)}
            style={{ background: "transparent", border: "none", color: T.muted, fontSize: 11, cursor: "pointer", padding: 2 }}>
            {exp ? "▲" : "▼"}
          </button>
        </div>
      </div>
      {exp && (
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${T.border}`, display: "flex", flexWrap: "wrap", gap: 5 }}>
          {ev.goalkeeper && <Badge label={`🧤 ${ev.goalkeeper.name} #${ev.goalkeeper.number}`} color="#60a5fa" />}
          {ev.sanctioned && <Badge label={`⚠️ ${ev.sanctioned.name} #${ev.sanctioned.number}`} color={T.orange} />}
          {ev.distance && <Badge label={`📏 ${DISTANCES.find(d => d.k === ev.distance)?.l || ev.distance}`} color={T.muted} />}
          {ev.situation && ev.situation !== "igualdad" && <Badge label={SITUATIONS.find(s => s.k === ev.situation)?.l || ev.situation} color={T.muted} />}
          {ev.throwType && <Badge label={THROW_TYPES.find(t => t.k === ev.throwType)?.l || ev.throwType} color={T.yellow} />}
          {ev.quadrant != null && <Badge label={`Cuad: ${QUADRANTS[ev.quadrant]?.label}`} color={T.muted} />}
        </div>
      )}
    </div>
  );
}
