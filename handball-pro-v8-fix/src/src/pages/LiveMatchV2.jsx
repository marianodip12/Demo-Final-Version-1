import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { supabase } from "../lib/supabase.js";
import { T, EV_TYPES, QUADRANTS } from "../utils/constants.js";
import { calcNextScore, fmtTime } from "../utils/calculations.js";
import { useMatchStats } from "../hooks/useMatchStats.js";
import { useInsights } from "../hooks/useInsights.js";
import { InsightBanner } from "../components/InsightBanner.jsx";

// ═══════════════════════════════════════════
// GOAL GRID — front view 3×3
// ═══════════════════════════════════════════
function GoalGrid({ selected, onSelect, result }) {
  const resultColor =
    result === "goal" ? "#22c55e" :
    result === "saved" ? "#60a5fa" :
    result === "miss"  ? "#ef4444" : "#f59e0b";

  const rows = [[0, 1, 2], [3, 4, 5], [6, 7, 8]];

  return (
    <div style={{ padding: "0 10px" }}>
      {/* Goal frame */}
      <div style={{
        border: "4px solid #e8533a",
        borderRadius: "6px 6px 0 0",
        background: "rgba(5,13,32,0.95)",
        overflow: "hidden",
        position: "relative",
      }}>
        {/* Net texture SVG */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.08, pointerEvents: "none" }}
          viewBox="0 0 120 80" preserveAspectRatio="none">
          {[8,16,24,32,40,48,56,64,72,80,88,96,104,112].map(x =>
            <line key={"v"+x} x1={x} y1={0} x2={x} y2={80} stroke="white" strokeWidth="0.8"/>
          )}
          {[8,16,24,32,40,48,56,64,72].map(y =>
            <line key={"h"+y} x1={0} y1={y} x2={120} y2={y} stroke="white" strokeWidth="0.8"/>
          )}
        </svg>

        {/* 3×3 clickable cells */}
        {rows.map((row, ri) => (
          <div key={ri} style={{ display: "flex" }}>
            {row.map(qi => {
              const sel = selected === qi;
              return (
                <div key={qi}
                  onClick={() => onSelect(sel ? null : qi)}
                  style={{
                    flex: 1, height: 54,
                    background: sel ? resultColor + "66" : "transparent",
                    border: "1px solid rgba(255,255,255,0.14)",
                    cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 0.12s",
                    position: "relative",
                  }}>
                  {sel && (
                    <div style={{
                      width: 12, height: 12, borderRadius: "50%",
                      background: resultColor,
                      boxShadow: `0 0 10px ${resultColor}`,
                    }} />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Post stripes on sides (decorative) */}
      <div style={{ height: 5, background: "#e8533a", borderRadius: "0 0 4px 4px" }} />

      {/* Quadrant hint label */}
      {selected != null && (
        <div style={{ textAlign: "center", fontSize: 9, color: resultColor, marginTop: 3, fontWeight: 700 }}>
          {QUADRANTS[selected]?.label}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// COURT ZONES — top-down view with zones
// ═══════════════════════════════════════════
function CourtZones({ selectedZone, onZoneSelect, heatCounts = {} }) {
  const maxHeat = Math.max(...Object.values(heatCounts), 1);

  const COURT_Z = [
    { key: "left_wing",  path: "M 0,0 L 65,0 L 35,195 L 0,195 Z", color: "#06b6d4", label: "EI", lx: 24, ly: 110 },
    { key: "left_back",  path: "M 65,0 L 110,0 L 95,195 L 35,195 Z", color: "#8b5cf6", label: "LI", lx: 72, ly: 120 },
    { key: "center",     path: "M 110,0 L 170,0 L 185,195 L 95,195 Z", color: "#f59e0b", label: "CE", lx: 140, ly: 130 },
    { key: "right_back", path: "M 170,0 L 215,0 L 245,195 L 185,195 Z", color: "#8b5cf6", label: "LD", lx: 208, ly: 120 },
    { key: "right_wing", path: "M 215,0 L 280,0 L 280,195 L 245,195 Z", color: "#06b6d4", label: "ED", lx: 256, ly: 110 },
    { key: "pivot",      path: "M 95,0 L 185,0 L 170,85 L 110,85 Z", color: "#ef4444", label: "PI", lx: 140, ly: 38 },
  ];

  return (
    <div style={{ padding: "0 10px" }}>
      <svg viewBox="0 0 280 200" width="100%" style={{ display: "block" }}>
        {/* Court background */}
        <rect x="0" y="0" width="280" height="200" fill="#0f2548" rx="0" />

        {/* 6m zone (blue area near goal) */}
        <path d="M 95,0 L 185,0 L 170,85 L 110,85 Z" fill="#1a3a7a" opacity="0.7"/>

        {/* Clickable zone fills */}
        {COURT_Z.map(z => {
          const sel = selectedZone === z.key;
          const heat = heatCounts[z.key] || 0;
          return (
            <path key={z.key} d={z.path}
              fill={sel
                ? z.color + "66"
                : heat > 0
                ? `rgba(59,130,246,${0.07 + (heat / maxHeat) * 0.28})`
                : "rgba(0,0,0,0)"}
              stroke={sel ? z.color : "rgba(255,255,255,0.15)"}
              strokeWidth={sel ? 2 : 1}
              style={{ cursor: "pointer" }}
              onClick={() => onZoneSelect(sel ? null : z.key)}
            />
          );
        })}

        {/* 9m dashed arc */}
        <path d="M 4,192 Q 140,22 276,192"
          fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeDasharray="7,5"/>

        {/* 6m arc */}
        <path d="M 108,85 Q 140,22 172,85"
          fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="1.8"/>

        {/* Zone labels */}
        {COURT_Z.map(z => (
          <text key={z.key+"t"} x={z.lx} y={z.ly}
            textAnchor="middle" fill={selectedZone === z.key ? z.color : "rgba(255,255,255,0.45)"}
            fontSize="11" fontWeight="800" style={{ pointerEvents: "none", userSelect: "none" }}>
            {z.label}
          </text>
        ))}

        {/* 7m pill button */}
        <rect x="116" y="48" width="48" height="20" rx="10"
          fill={selectedZone === "penal" ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.75)"}
          style={{ cursor: "pointer" }}
          onClick={() => onZoneSelect(selectedZone === "penal" ? null : "penal")}
        />
        <text x="140" y="62" textAnchor="middle"
          fill={selectedZone === "penal" ? "#0f2548" : "#1a3a7a"}
          fontSize="9" fontWeight="800" style={{ pointerEvents: "none" }}>
          7m
        </text>
      </svg>
    </div>
  );
}

// ═══════════════════════════════════════════
// PLAYER STRIP — left vertical scroller
// ═══════════════════════════════════════════
function PlayerStrip({ players, selected, onSelect, teamColor }) {
  const stripRef = useRef(null);

  const scrollTo = (dir) => {
    if (!stripRef.current) return;
    stripRef.current.scrollBy({ top: dir * 80, behavior: "smooth" });
  };

  return (
    <div style={{
      width: 70, flexShrink: 0,
      display: "flex", flexDirection: "column",
      background: "rgba(0,0,0,0.25)",
      borderRight: "1px solid rgba(255,255,255,0.06)",
      height: "100%",
    }}>
      {/* Up arrow */}
      <button onClick={() => scrollTo(-1)}
        style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 16, cursor: "pointer", padding: "6px 0", flexShrink: 0 }}>
        ▲
      </button>

      {/* Scrollable player list */}
      <div ref={stripRef} style={{
        flex: 1, overflowY: "auto", overflowX: "hidden",
        scrollbarWidth: "none", msOverflowStyle: "none",
        display: "flex", flexDirection: "column", gap: 5, padding: "2px 6px",
      }}>
        <style>{`.playerstrip::-webkit-scrollbar{display:none}`}</style>

        {/* Portería vacía option */}
        <div onClick={() => onSelect(selected?.__empty__ ? null : { __empty__: true, name: "Portería vacía", number: "🚫" })}
          style={{
            borderRadius: 10, padding: "6px 3px", textAlign: "center", cursor: "pointer",
            background: selected?.__empty__ ? "rgba(100,116,139,0.35)" : "rgba(255,255,255,0.04)",
            border: `2px solid ${selected?.__empty__ ? T.muted : "rgba(255,255,255,0.08)"}`,
            flexShrink: 0,
          }}>
          <div style={{ fontSize: 16, lineHeight: 1 }}>🚫</div>
          <div style={{ fontSize: 7, color: T.muted, lineHeight: 1.3, marginTop: 2 }}>Sin arq.</div>
        </div>

        {players.map(p => {
          const sel = selected?.id === p.id || selected?.name === p.name;
          const color = sel ? teamColor : "rgba(255,255,255,0.75)";
          return (
            <div key={p.id || p.name}
              onClick={() => onSelect(sel ? null : p)}
              style={{
                borderRadius: 10, padding: "7px 3px", textAlign: "center",
                cursor: "pointer", flexShrink: 0,
                background: sel ? teamColor + "33" : "rgba(255,255,255,0.04)",
                border: `2px solid ${sel ? teamColor : "rgba(255,255,255,0.08)"}`,
                transition: "all 0.12s",
              }}>
              <div style={{ fontSize: 18, fontWeight: 900, color, lineHeight: 1 }}>{p.number}</div>
              <div style={{ fontSize: 8, color: sel ? teamColor : "rgba(255,255,255,0.45)", fontWeight: 700, lineHeight: 1.2, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {(p.name || "").split(" ")[0]}
              </div>
            </div>
          );
        })}
      </div>

      {/* Down arrow */}
      <button onClick={() => scrollTo(1)}
        style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 16, cursor: "pointer", padding: "6px 0", flexShrink: 0 }}>
        ▼
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════
// LINEUP MODAL — pick squad for today
// ═══════════════════════════════════════════
function LineupModal({ players, lineup, onSave, onClose, teamColor }) {
  const [active, setActive] = useState(new Set(lineup.map(p => p.id || p.name)));

  const toggle = (p) => {
    const key = p.id || p.name;
    setActive(prev => {
      const n = new Set(prev);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });
  };

  const save = () => {
    const selected = players.filter(p => active.has(p.id || p.name));
    onSave(selected);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.88)", backdropFilter: "blur(8px)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 400 }}>
      <div style={{ background: "#0d1526", borderRadius: "20px 20px 0 0", border: `1px solid #1a2d4a`, width: "100%", maxWidth: 430, maxHeight: "85vh", overflowY: "auto", padding: "16px 16px env(safe-area-inset-bottom,16px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#e2e8f0" }}>👥 Plantel de hoy</div>
            <div style={{ fontSize: 11, color: "#64748b" }}>Seleccioná quiénes juegan</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,.07)", border: "none", color: "#64748b", borderRadius: 8, width: 28, height: 28, cursor: "pointer", fontSize: 14 }}>✕</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 7, marginBottom: 16 }}>
          {players.map(p => {
            const key = p.id || p.name;
            const on = active.has(key);
            return (
              <div key={key} onClick={() => toggle(p)}
                style={{
                  background: on ? teamColor + "28" : "rgba(255,255,255,0.04)",
                  border: `2px solid ${on ? teamColor : "#1a2d4a"}`,
                  borderRadius: 12, padding: "10px 6px", textAlign: "center", cursor: "pointer",
                  transition: "all 0.12s",
                }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: on ? teamColor : "rgba(255,255,255,0.5)", lineHeight: 1 }}>
                  {p.number}
                </div>
                <div style={{ fontSize: 9, color: on ? teamColor : "#64748b", fontWeight: 700, marginTop: 3 }}>
                  {p.name}
                </div>
                <div style={{ fontSize: 8, color: "#64748b", marginTop: 1 }}>{p.position}</div>
              </div>
            );
          })}
        </div>

        <button onClick={save}
          style={{ width: "100%", background: teamColor, border: "none", color: "#fff", borderRadius: 12, padding: "14px", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
          ✓ Confirmar plantel ({active.size} jugadores)
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// MAIN LiveMatchV2
// ═══════════════════════════════════════════
export function LiveMatchV2({
  events, setEvents,
  matchInfo, homeTeam, awayPlayers,
  persistEvent, updatePersistedEvent,
  onCloseMatch, onStartMatch,
  matchStatus,
}) {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedGoalQ, setSelectedGoalQ]   = useState(null);
  const [selectedZone, setSelectedZone]     = useState(null);
  const [activeTab, setActiveTab]           = useState(null); // "sanciones" | "ataque" | "defensa"
  const [lineup, setLineup]                 = useState(null); // null = not set yet
  const [showLineup, setShowLineup]         = useState(false);
  const [lastResult, setLastResult]         = useState(null); // "goal" | "saved" | "miss"

  // Timer
  const [half, setHalf]             = useState(1);
  const [timerSecs, setTimerSecs]   = useState(30 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [exclusions, setExclusions] = useState([]);
  const timerRef = useRef(null);

  const homeC = homeTeam?.color || T.accent;
  const awayC = "#64748b";
  const allPlayers = homeTeam?.players || [];
  const activePlayers = lineup || allPlayers;

  const { score, stats, heatCounts } = useMatchStats(events);
  const insights = useInsights(stats);

  // Timer effect
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSecs(s => {
          if (s <= 1) { clearInterval(timerRef.current); setTimerRunning(false); return 0; }
          return s - 1;
        });
        setExclusions(prev => prev.map(e => ({ ...e, secs: e.secs - 1 })).filter(e => e.secs > 0));
      }, 1000);
    } else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [timerRunning]);

  const realMinute = useMemo(() =>
    Math.max(1, Math.ceil((30 * 60 - timerSecs) / 60) + (half === 2 ? 30 : 0)),
  [timerSecs, half]);

  const startHalf = (h) => { setHalf(h); setTimerSecs(30 * 60); setTimerRunning(true); setExclusions([]); };

  // Save event
  const saveEv = useCallback(async (ev) => {
    if (!persistEvent) return;
    const uuid = await persistEvent(ev).catch(() => null);
    if (uuid && uuid !== ev.id) setEvents(prev => prev.map(e => e.id === ev.id ? { ...e, id: uuid } : e));
  }, [persistEvent, setEvents]);

  const deleteEvent = useCallback((id) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    supabase.from("events").delete().eq("id", id).catch(() => {});
  }, [setEvents]);

  // Register a shot event
  const registerShot = useCallback((type, team = "home") => {
    const sc = calcNextScore(events, type, team);
    const min = timerRunning || timerSecs < 30 * 60 ? realMinute : 1;
    const shooter = selectedPlayer && !selectedPlayer.__empty__
      ? { name: selectedPlayer.name, number: selectedPlayer.number }
      : null;

    const ev = {
      id: Date.now(), min, team, type,
      zone: selectedZone, quadrant: selectedGoalQ,
      shooter, goalkeeper: null, sanctioned: null,
      completed: !!selectedGoalQ && !!selectedZone,
      quickMode: !selectedGoalQ || !selectedZone,
      ...sc,
    };

    setEvents(prev => [...prev, ev]);
    saveEv(ev);
    setLastResult(type);

    // Feedback flash then reset
    setTimeout(() => {
      setSelectedGoalQ(null);
      setSelectedZone(null);
      setLastResult(null);
      setActiveTab(null);
    }, 600);
  }, [events, selectedPlayer, selectedZone, selectedGoalQ, timerRunning, timerSecs, realMinute, setEvents, saveEv]);

  // Register disciplinary event
  const registerDisc = useCallback((type) => {
    const prev = events.filter(e => e.hScore != null).slice(-1)[0] || { hScore: 0, aScore: 0 };
    const min = timerRunning || timerSecs < 30 * 60 ? realMinute : 1;
    const sanctioned = selectedPlayer && !selectedPlayer.__empty__
      ? { name: selectedPlayer.name, number: selectedPlayer.number }
      : null;
    const ev = {
      id: Date.now(), min, team: "home", type,
      sanctioned, completed: true, quickMode: false,
      hScore: prev.hScore, aScore: prev.aScore,
    };
    setEvents(prev2 => [...prev2, ev]);
    saveEv(ev);
    if (type === "exclusion") setExclusions(p => [...p, { id: Date.now(), team: "home", player: selectedPlayer?.number, secs: 120 }]);
    setActiveTab(null);
  }, [events, selectedPlayer, timerRunning, timerSecs, realMinute, setEvents, saveEv]);

  // Register goal received
  const registerAwayGoal = useCallback(() => {
    const sc = calcNextScore(events, "goal", "away");
    const min = timerRunning || timerSecs < 30 * 60 ? realMinute : 1;
    const ev = { id: Date.now(), min, team: "away", type: "goal", completed: true, quickMode: true, ...sc };
    setEvents(prev => [...prev, ev]);
    saveEv(ev);
  }, [events, timerRunning, timerSecs, realMinute, setEvents, saveEv]);

  // ── NO MATCH ──
  if (matchStatus !== "live") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "70vh", gap: 16 }}>
        <div style={{ fontSize: 56 }}>🤾</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: T.text }}>Sin partido en curso</div>
        <div style={{ fontSize: 13, color: T.muted, marginBottom: 8 }}>Iniciá un nuevo partido desde Partidos</div>
        <button onClick={onStartMatch}
          style={{ background: homeC, border: "none", color: "#fff", borderRadius: 14, padding: "14px 28px", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>
          + Nuevo partido
        </button>
      </div>
    );
  }

  const selectedPlayerLabel = selectedPlayer
    ? selectedPlayer.__empty__
      ? "Sin arquero"
      : `${selectedPlayer.number}   ${selectedPlayer.name}`
    : "— Seleccioná un jugador —";

  // ── ACTION PANELS ──
  const SancionesPanel = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "8px 10px" }}>
      {[
        { type: "exclusion",   l: "⏱  Exclusión 2'",    c: "#f97316" },
        { type: "yellow_card", l: "🟨  Tarjeta amarilla", c: "#f59e0b" },
        { type: "red_card",    l: "🟥  Tarjeta roja",     c: "#ef4444" },
        { type: "blue_card",   l: "🟦  Tarjeta azul",     c: "#3b82f6" },
        { type: "timeout",     l: "⏸  Tiempo muerto",    c: "#8b5cf6" },
        { type: "half_time",   l: "🔔  Descanso",        c: "#64748b" },
      ].map(s => (
        <button key={s.type} onClick={() => registerDisc(s.type)}
          style={{ background: s.c + "22", border: `1.5px solid ${s.c}88`, borderRadius: 50, padding: "12px 16px", color: s.c, fontWeight: 700, fontSize: 13, cursor: "pointer", textAlign: "left" }}>
          {s.l}
        </button>
      ))}
    </div>
  );

  const AtaquePanel = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "8px 10px" }}>
      {[
        { type: "goal",     team: "home", l: "Lanzar con gol",     c: "#22c55e",  icon: "↗👍+1" },
        { type: "miss",     team: "home", l: "Desechar sin éxito",  c: "#ef4444",  icon: "↗👎" },
        { type: "turnover", team: "home", l: "No hay que tirar",    c: "#94a3b8",  icon: "↗∅" },
        { type: "miss",     team: "home", l: "Tiro errado",         c: "#64748b",  icon: "❌" },
      ].map((a, i) => (
        <button key={i} onClick={() => registerShot(a.type, a.team)}
          style={{ background: a.c + "22", border: `1.5px solid ${a.c}88`, borderRadius: 50, padding: "12px 16px", color: a.c, fontWeight: 700, fontSize: 13, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>{a.l}</span>
          <span style={{ fontSize: 16, opacity: 0.7 }}>{a.icon}</span>
        </button>
      ))}
    </div>
  );

  const DefensaPanel = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 7, padding: "8px 10px" }}>
      {/* Bad actions (red) */}
      {[
        { l: "Anticipación equivocada", icon: "←◎·" },
        { l: "Posicionamiento incorrecto", icon: "⊙•" },
        { l: "Estática", icon: "┼" },
        { l: "Levanta la pierna", icon: "↗🦵" },
        { l: "Baja el brazo", icon: "↙✋" },
      ].map((a, i) => (
        <button key={i}
          style={{ background: "rgba(239,68,68,0.15)", border: "1.5px solid rgba(239,68,68,0.4)", borderRadius: 50, padding: "10px 14px", color: "#ef4444", fontWeight: 700, fontSize: 12, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>{a.l}</span>
          <span style={{ fontSize: 13, opacity: 0.7 }}>{a.icon}</span>
        </button>
      ))}
      {/* Good actions (green) */}
      {[
        { l: "Buena anticipación", icon: "◎→·" },
        { l: "Influye en el disparo", icon: "C(●)" },
      ].map((a, i) => (
        <button key={i}
          style={{ background: "rgba(34,197,94,0.15)", border: "1.5px solid rgba(34,197,94,0.4)", borderRadius: 50, padding: "10px 14px", color: "#22c55e", fontWeight: 700, fontSize: 12, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>{a.l}</span>
          <span style={{ fontSize: 13, opacity: 0.7 }}>{a.icon}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "calc(100vh - 50px)",
      background: "#080f20",
      overflow: "hidden",
      fontFamily: T.font,
    }}>
      <style>{`@keyframes livePulse{0%,100%{opacity:1}50%{opacity:.25}} @keyframes flashGreen{0%{background:rgba(34,197,94,.4)}100%{background:transparent}}`}</style>

      {/* ── TOP HEADER ─────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center",
        padding: "8px 10px 6px",
        background: "rgba(0,0,0,0.4)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        flexShrink: 0, gap: 8,
      }}>
        {/* Selected player display */}
        <div style={{ width: 60, flexShrink: 0 }}>
          {selectedPlayer && !selectedPlayer.__empty__ ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: homeC, lineHeight: 1 }}>{selectedPlayer.number}</div>
              <div style={{ fontSize: 8, color: homeC, fontWeight: 700, lineHeight: 1.2 }}>{selectedPlayer.name.split(" ")[0]}</div>
            </div>
          ) : (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 9, color: T.muted, lineHeight: 1.3 }}>Ninguno</div>
            </div>
          )}
        </div>

        {/* Score */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <span style={{ fontSize: 26, fontWeight: 900, color: homeC }}>{score.h}</span>
          <span style={{ fontSize: 18, color: T.muted, fontWeight: 300 }}>–</span>
          <span style={{ fontSize: 26, fontWeight: 900, color: awayC }}>{score.a}</span>
        </div>

        {/* Timer */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <button onClick={() => setTimerRunning(r => !r)}
            style={{
              background: timerRunning ? "rgba(239,68,68,0.2)" : "rgba(232,83,58,0.85)",
              border: "none", borderRadius: 50, padding: "6px 14px",
              color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 5,
            }}>
            {timerRunning ? "⏸" : "▶"}
          </button>
          <div style={{ textAlign: "right" }}>
            <div style={{
              fontSize: 18, fontWeight: 900, letterSpacing: 1,
              color: timerSecs === 0 ? T.red : timerRunning ? "#e8e8e8" : T.yellow,
              lineHeight: 1,
            }}>
              {fmtTime(timerSecs)}
            </div>
            <div style={{ display: "flex", gap: 3, justifyContent: "flex-end", marginTop: 2 }}>
              {[1, 2].map(h => (
                <button key={h} onClick={() => startHalf(h)}
                  style={{ background: half === h ? T.accent + "44" : "transparent", border: `1px solid ${half === h ? T.accent : "rgba(255,255,255,0.15)"}`, color: half === h ? T.accent : T.muted, borderRadius: 5, padding: "2px 6px", fontSize: 9, cursor: "pointer", fontWeight: 700 }}>
                  {h}T
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Close + lineup */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
          <button onClick={() => setShowLineup(true)}
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: T.muted, borderRadius: 7, padding: "4px 7px", fontSize: 9, fontWeight: 700, cursor: "pointer" }}>
            👥
          </button>
          <button onClick={onCloseMatch}
            style={{ background: "rgba(239,68,68,0.18)", border: "1px solid rgba(239,68,68,0.35)", color: "#fca5a5", borderRadius: 7, padding: "4px 7px", fontSize: 9, fontWeight: 700, cursor: "pointer" }}>
            🏁
          </button>
        </div>
      </div>

      {/* ── EXCLUSIONS BAR ─────────────────────────── */}
      {exclusions.length > 0 && (
        <div style={{ display: "flex", gap: 5, padding: "4px 10px", background: "rgba(249,115,22,0.1)", borderBottom: "1px solid rgba(249,115,22,0.25)", flexShrink: 0 }}>
          {exclusions.map(ex => (
            <div key={ex.id} style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(249,115,22,0.2)", borderRadius: 8, padding: "3px 8px", flex: 1 }}>
              <span style={{ fontSize: 10, color: T.orange, fontWeight: 700 }}>
                {ex.team === "home" ? homeTeam?.name : matchInfo.away}{ex.player ? ` #${ex.player}` : ""}
              </span>
              <span style={{ fontSize: 12, fontWeight: 900, color: ex.secs <= 30 ? T.red : T.orange, marginLeft: "auto" }}>
                {fmtTime(ex.secs)}
              </span>
              <button onClick={() => setExclusions(p => p.filter(e => e.id !== ex.id))}
                style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 11, padding: 0 }}>✕</button>
            </div>
          ))}
        </div>
      )}

      {/* ── MAIN BODY: LEFT STRIP + RIGHT CONTENT ─── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Left player strip */}
        <PlayerStrip
          players={activePlayers}
          selected={selectedPlayer}
          onSelect={setSelectedPlayer}
          teamColor={homeC}
        />

        {/* Right main content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Gol / Guardar / action top row */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 18, padding: "8px 10px 4px",
            flexShrink: 0,
          }}>
            <div style={{ textAlign: "center" }}>
              <button onClick={() => registerShot("goal", "home")}
                style={{
                  width: 50, height: 50, borderRadius: "50%",
                  background: lastResult === "goal" ? "rgba(34,197,94,0.9)" : "rgba(220,70,50,0.85)",
                  border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, boxShadow: "0 2px 12px rgba(220,70,50,0.5)",
                  transition: "background 0.2s",
                }}>
                <span style={{ fontSize: 22 }}>⚽</span>
              </button>
              <div style={{ fontSize: 10, color: "#e2e8f0", fontWeight: 700, marginTop: 3 }}>Gol</div>
            </div>

            <div style={{ textAlign: "center" }}>
              <button onClick={() => registerShot("saved", "home")}
                style={{
                  width: 50, height: 50, borderRadius: "50%",
                  background: lastResult === "saved" ? "rgba(96,165,250,0.9)" : "rgba(20,130,120,0.85)",
                  border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 2px 12px rgba(20,130,120,0.4)",
                  transition: "background 0.2s",
                }}>
                <span style={{ fontSize: 22 }}>🧤</span>
              </button>
              <div style={{ fontSize: 10, color: "#e2e8f0", fontWeight: 700, marginTop: 3 }}>Guardar el tiro</div>
            </div>

            <div style={{ textAlign: "center" }}>
              <button onClick={() => registerShot("miss", "home")}
                style={{
                  width: 50, height: 50, borderRadius: "50%",
                  background: "rgba(100,116,139,0.6)",
                  border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  transition: "background 0.2s",
                }}>
                <span style={{ fontSize: 22 }}>❌</span>
              </button>
              <div style={{ fontSize: 10, color: "#e2e8f0", fontWeight: 700, marginTop: 3 }}>Errado</div>
            </div>

            <div style={{ textAlign: "center" }}>
              <button onClick={registerAwayGoal}
                style={{
                  width: 50, height: 50, borderRadius: "50%",
                  background: "rgba(239,68,68,0.5)",
                  border: "2px solid rgba(239,68,68,0.7)", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.2s",
                }}>
                <span style={{ fontSize: 16, fontWeight: 900, color: "#fca5a5" }}>🥅</span>
              </button>
              <div style={{ fontSize: 10, color: "#fca5a5", fontWeight: 700, marginTop: 3 }}>Gol rival</div>
            </div>
          </div>

          {/* Goal grid */}
          <div style={{ flexShrink: 0 }}>
            <GoalGrid selected={selectedGoalQ} onSelect={setSelectedGoalQ} result={lastResult} />
          </div>

          {/* Status banner / insights */}
          {insights.length > 0 ? (
            <div style={{
              padding: "4px 10px", flexShrink: 0,
            }}>
              {insights.slice(0, 1).map(ins => (
                <div key={ins.id} style={{
                  background: ins.bg, border: `1px solid ${ins.border}`,
                  borderRadius: 8, padding: "5px 10px",
                  display: "flex", alignItems: "center", gap: 7,
                }}>
                  <span style={{ fontSize: 14 }}>{ins.icon}</span>
                  <span style={{ fontSize: 11, color: ins.color, fontWeight: 600 }}>{ins.text}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              background: "rgba(59,130,246,0.15)", padding: "5px 14px", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.red, animation: "livePulse 1.4s infinite" }} />
              <span style={{ fontSize: 11, color: "#7dd3fc", fontWeight: 700, letterSpacing: 1 }}>
                {timerRunning ? "EN JUEGO" : "INTERRUPCIÓN DE JUEGO"}
              </span>
              <span style={{ fontSize: 10, color: T.muted }}>·</span>
              <span style={{ fontSize: 10, color: T.muted }}>{matchInfo.home} {score.h}–{score.a} {matchInfo.away}</span>
            </div>
          )}

          {/* Court zones - scrollable area */}
          <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
            <CourtZones
              selectedZone={selectedZone}
              onZoneSelect={setSelectedZone}
              heatCounts={heatCounts}
            />

            {/* Action panel overlay */}
            {activeTab && (
              <div style={{
                position: "absolute", inset: 0,
                background: "rgba(6,10,22,0.93)",
                backdropFilter: "blur(4px)",
                overflowY: "auto",
              }}>
                {activeTab === "sanciones" && <SancionesPanel />}
                {activeTab === "ataque"    && <AtaquePanel />}
                {activeTab === "defensa"   && <DefensaPanel />}
              </div>
            )}
          </div>

          {/* Selected player label */}
          <div style={{
            padding: "5px 10px", flexShrink: 0,
            background: "rgba(0,0,0,0.3)",
            borderTop: "1px solid rgba(255,255,255,0.05)",
          }}>
            <div style={{
              background: "rgba(255,255,255,0.06)", borderRadius: 8,
              padding: "7px 12px", fontSize: 12, color: selectedPlayer ? homeC : T.muted,
              fontWeight: selectedPlayer ? 700 : 400, textAlign: "center",
              letterSpacing: 0.5,
            }}>
              {selectedPlayerLabel}
            </div>
          </div>

          {/* ── BOTTOM TABS ────────────────────────── */}
          <div style={{
            display: "flex", flexShrink: 0,
            background: "rgba(0,0,0,0.5)",
            borderTop: "1px solid rgba(255,255,255,0.07)",
          }}>
            {[
              { k: "sanciones", l: "Sanciones", c: "#f97316" },
              { k: "ataque",    l: "Ataque",    c: "#22c55e" },
              { k: "defensa",   l: "Defensa",   c: "#60a5fa" },
            ].map(t => (
              <button key={t.k}
                onClick={() => setActiveTab(activeTab === t.k ? null : t.k)}
                style={{
                  flex: 1,
                  background: activeTab === t.k ? t.c + "22" : "transparent",
                  border: "none",
                  borderTop: activeTab === t.k ? `2px solid ${t.c}` : "2px solid transparent",
                  color: activeTab === t.k ? t.c : "rgba(255,255,255,0.5)",
                  padding: "11px 6px",
                  fontWeight: activeTab === t.k ? 800 : 600,
                  fontSize: 12,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}>
                {t.l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lineup modal */}
      {showLineup && (
        <LineupModal
          players={allPlayers}
          lineup={activePlayers}
          onSave={p => { setLineup(p); setShowLineup(false); }}
          onClose={() => setShowLineup(false)}
          teamColor={homeC}
        />
      )}
    </div>
  );
}
