import { useState, useRef, useEffect, useCallback } from "react";
import { T, QUADRANTS } from "../utils/constants.js";
import { calcNextScore, fmtTime } from "../utils/calculations.js";

// ─── THEME OVERRIDES ────────────────────────────────────
const R = {
  bg:       "#0a1628",
  surface:  "#0f2040",
  card:     "#132848",
  border:   "#1e3a5f",
  accent:   "#e85d4a",   // salmon/coral like the app
  accentB:  "#4ecdc4",   // teal
  text:     "#ffffff",
  muted:    "#6b8db0",
  green:    "#4ecdc4",
  red:      "#e85d4a",
  yellow:   "#f5c842",
  goal:     "#e85d4a",
};

// ── GOALKEEPER DEFENSE ACTIONS ───────────────────────────
const GK_ACTIONS = [
  { k: "anticipacion_mala",    l: "Anticipación equivocada",    icon: "←⊙",  good: false },
  { k: "posicionamiento_mal",  l: "Posicionamiento incorrecto", icon: "⊙•",  good: false },
  { k: "estatica",             l: "Estática",                   icon: "✛",   good: false },
  { k: "levanta_pierna",       l: "Levanta la pierna",          icon: "↗🦵", good: false },
  { k: "baja_brazo",           l: "Baje el brazo",              icon: "↙✋", good: false },
  { k: "buena_anticipacion",   l: "Buena anticipación",         icon: "⊙→",  good: true  },
  { k: "influye_disparo",      l: "Influye en el disparo",      icon: "C⊙",  good: true  },
];

// ── ATTACK ACTIONS ───────────────────────────────────────
const ATTACK_ACTIONS = [
  { k: "miss",     l: "Desechar sin éxito",  icon: "→👎", good: false, evType: "miss"     },
  { k: "no_shoot", l: "No hay que tirar",    icon: "→∅",  good: null,  evType: "turnover"  },
  { k: "goal",     l: "Lanzar con gol",      icon: "→👍+1",good: true, evType: "goal"     },
  { k: "good_pass",l: "Desechar con éxito",  icon: "→👍",  good: true, evType: "turnover" },
];

// ── SANCTION ACTIONS ─────────────────────────────────────
const SANCTION_ACTIONS = [
  { k: "red_card",    l: "Tarjeta roja",    color: "#e85d4a", evType: "red_card"    },
  { k: "yellow_card", l: "Tarjeta amarilla",color: "#f5c842", evType: "yellow_card" },
  { k: "exclusion",   l: "2 minutos",       color: "#c0c0c0", evType: "exclusion"   },
];

// ═══════════════════════════════════════════════════════════
//  HANDBALL GOAL SVG
// ═══════════════════════════════════════════════════════════
function HandballGoal({ selectedQ, onSelectQ }) {
  const rows    = [[0,1,2],[3,4,5],[6,7,8]];
  const W = 300, H = 180;
  const COLS = 3, ROWS = 3;
  const cW = W / COLS, cH = H / ROWS;
  const POST = 12;

  return (
    <svg viewBox={`0 0 ${W + POST*2} ${H + POST}`} width="100%" style={{ display:"block", maxHeight:200 }}>
      {/* Net texture */}
      <defs>
        <pattern id="net" patternUnits="userSpaceOnUse" width="12" height="10">
          <path d="M0 0 L12 10 M12 0 L0 10" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" fill="none"/>
        </pattern>
        <linearGradient id="postGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#cc3322"/>
          <stop offset="100%" stopColor="#881a11"/>
        </linearGradient>
      </defs>

      {/* Net background */}
      <rect x={POST} y={0} width={W} height={H} fill="url(#net)" rx="2"/>

      {/* Grid cells */}
      {rows.map((row,ri) => row.map(qi => {
        const col   = qi % COLS;
        const x     = POST + col * cW;
        const y     = ri * cH;
        const sel   = selectedQ === qi;
        return (
          <rect key={qi}
            x={x+1} y={y+1} width={cW-2} height={cH-2}
            rx="3"
            fill={sel ? "rgba(232,93,74,0.55)" : "rgba(255,255,255,0.03)"}
            stroke={sel ? "#e85d4a" : "rgba(255,255,255,0.18)"}
            strokeWidth={sel ? 2.5 : 1}
            style={{ cursor:"pointer", transition:"all .12s" }}
            onClick={() => onSelectQ(sel ? null : qi)}
          />
        );
      }))}

      {/* Posts – horizontal top */}
      <rect x={POST} y={0} width={W} height={POST} fill="url(#postGrad)" rx="4"/>
      {/* Posts – left vertical */}
      <rect x={0} y={0} width={POST} height={H+POST} fill="url(#postGrad)" rx="4"/>
      {/* Posts – right vertical */}
      <rect x={POST+W} y={0} width={POST} height={H+POST} fill="url(#postGrad)" rx="4"/>
      {/* Posts – bottom bar */}
      <rect x={0} y={H} width={W+POST*2} height={POST} fill="url(#postGrad)" rx="3"/>

      {/* White post stripes */}
      {[0,2,4,6,8,10].map(i => (
        <rect key={i} x={POST-1} y={i*18} width={POST+2} height={9} fill="rgba(255,255,255,0.35)" rx="2"/>
      ))}
      {[0,2,4,6,8,10].map(i => (
        <rect key={"r"+i} x={POST+W-1} y={i*18} width={POST+2} height={9} fill="rgba(255,255,255,0.35)" rx="2"/>
      ))}

      {/* Selected quadrant label */}
      {selectedQ != null && (() => {
        const col = selectedQ % COLS;
        const row = Math.floor(selectedQ / COLS);
        const cx  = POST + col * cW + cW/2;
        const cy  = row * cH + cH/2;
        return (
          <text x={cx} y={cy+5} textAnchor="middle"
            style={{ fontSize:22, fill:"#fff", fontWeight:900, pointerEvents:"none" }}>
            ✓
          </text>
        );
      })()}
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════
//  COURT ZONE SELECTOR (top-down view)
// ═══════════════════════════════════════════════════════════
const COURT_ZONES = {
  left_wing:  { label:"EI", path:"M 0 0 L 56 0 A 84 84 0 0 1 67 42 L 31 63 A 126 126 0 0 0 14 0 Z",  lx:22, ly:34, color:"#06b6d4" },
  left_back:  { label:"LI", path:"M 67 42 A 84 84 0 0 1 98 73 L 77 109 A 126 126 0 0 0 31 63 Z",     lx:53, ly:74, color:"#8b5cf6" },
  center:     { label:"CE", path:"M 98 73 A 84 84 0 0 1 182 73 L 203 109 A 126 126 0 0 0 77 109 Z",  lx:140,ly:90, color:"#f5c842" },
  right_back: { label:"LD", path:"M 182 73 A 84 84 0 0 1 213 42 L 249 63 A 126 126 0 0 0 203 109 Z", lx:223,ly:74, color:"#8b5cf6" },
  right_wing: { label:"ED", path:"M 280 0 L 224 0 A 84 84 0 0 0 213 42 L 249 63 A 126 126 0 0 1 266 0 Z",lx:256,ly:34,color:"#06b6d4"},
  pivot:      { label:"PI", path:"M 98 73 A 84 84 0 0 1 182 73 L 140 0 Z",                           lx:140,ly:50, color:"#e85d4a" },
  penal:      { label:"7m", path:"M 116 -28 L 164 -28 L 164 0 L 116 0 Z",                            lx:140,ly:-16,color:"#ffffff" },
};

function CourtZones({ selectedZone, onSelectZone }) {
  return (
    <div style={{ background:"#091830", borderRadius:12, overflow:"hidden" }}>
      <svg viewBox="-8 -36 296 160" width="100%" style={{ display:"block" }}>
        {/* Field */}
        <rect x="-8" y="-36" width="296" height="196" fill="#091830"/>
        <rect x="0" y="0" width="280" height="130" fill="#0d2545" rx="4"/>
        {/* 6m arc */}
        <path d="M 56 0 A 84 84 0 0 1 224 0 Z" fill="#0a1e3a"/>
        {/* Goal area */}
        <rect x="100" y="-8" width="80" height="8" fill="#1a3a5c" rx="2"/>

        {/* Zone paths */}
        {Object.entries(COURT_ZONES).map(([key, z]) => {
          const sel = selectedZone === key;
          return (
            <path key={key} d={z.path}
              fill={sel ? z.color + "80" : z.color + "18"}
              stroke={sel ? z.color : z.color + "55"}
              strokeWidth={sel ? 2 : 1}
              style={{ cursor:"pointer", transition:"all .15s" }}
              onClick={() => onSelectZone(sel ? null : key)}
            />
          );
        })}

        {/* Labels */}
        {Object.entries(COURT_ZONES).map(([key, z]) => {
          const sel = selectedZone === key;
          return (
            <text key={key+"t"} x={z.lx} y={z.ly} textAnchor="middle"
              style={{ fontSize:9, fill: sel ? "#fff" : "rgba(255,255,255,.5)", fontWeight:700, pointerEvents:"none", userSelect:"none" }}>
              {z.label}
            </text>
          );
        })}

        {/* 7m marker */}
        <circle cx="140" cy="18" r="3" fill="rgba(255,255,255,.4)"/>
        <text x="140" y="42" textAnchor="middle" style={{ fontSize:7, fill:"rgba(255,255,255,.3)" }}>7m</text>
      </svg>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  PLAYER STRIP (left vertical scroll)
// ═══════════════════════════════════════════════════════════
function PlayerStrip({ players, selectedId, onSelect }) {
  const stripRef = useRef(null);

  // Build full list: goalkeeper entries + empty goal + field players
  const goalkeepers = players.filter(p => p.position === "Arquero" || p.pos === "Arquero");
  const fieldPlayers = players.filter(p => p.position !== "Arquero" && p.pos !== "Arquero");

  const strip = [
    ...goalkeepers.map(p => ({ ...p, _type: "gk" })),
    { id: "__empty__", name: "Portería vacía", number: null, _type: "empty" },
    ...fieldPlayers.map(p => ({ ...p, _type: "field" })),
  ];

  return (
    <div ref={stripRef}
      style={{
        width: 64,
        height: "100%",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 3,
        padding: "4px 3px",
        scrollbarWidth: "none",
        flexShrink: 0,
        background: "rgba(6,12,24,0.6)",
      }}>
      <style>{`.strip::-webkit-scrollbar{display:none}`}</style>
      {strip.map(p => {
        const sel = selectedId === p.id;
        const isEmpty = p._type === "empty";
        const isGK    = p._type === "gk";

        return (
          <button key={p.id}
            onClick={() => onSelect(p)}
            style={{
              flexShrink: 0,
              width: "100%",
              minHeight: 58,
              borderRadius: 10,
              border: `1.5px solid ${sel ? (isGK ? R.accentB : isEmpty ? R.muted : R.accent) : "rgba(255,255,255,0.08)"}`,
              background: sel
                ? isGK   ? R.accentB + "33"
                : isEmpty ? "rgba(100,100,100,0.2)"
                :           R.accent + "22"
                : "rgba(255,255,255,0.04)",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              padding: "4px 2px",
              transition: "all .15s",
            }}>
            {isEmpty ? (
              <>
                <div style={{ fontSize:16, color: R.muted }}>⊘</div>
                <div style={{ fontSize:7, color: R.muted, textAlign:"center", lineHeight:1.2 }}>Portería{"\n"}vacía</div>
              </>
            ) : (
              <>
                <div style={{
                  fontSize: 16, fontWeight: 900, lineHeight: 1,
                  color: sel ? (isGK ? R.accentB : R.accent) : R.text,
                }}>
                  {p.number}
                </div>
                <div style={{
                  fontSize: 7, color: sel ? R.text : R.muted,
                  textAlign: "center", lineHeight: 1.2,
                  maxWidth: 56, overflow: "hidden",
                  textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {p.name?.split(" ")[0]}
                </div>
                {isGK && (
                  <div style={{ fontSize: 6, color: R.accentB, fontWeight: 700 }}>GK</div>
                )}
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  LIVE RECORDER — main component
// ═══════════════════════════════════════════════════════════
export function LiveRecorder({
  events, setEvents,
  homeTeam, awayTeam,
  matchInfo,
  persistEvent, updatePersistedEvent,
  timerSecs, timerRunning, half, realMinute,
  onToggleTimer, onStartHalf,
  score,
  onCloseMatch,
  matchStatus,
  onStartMatch,
}) {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedZone,   setSelectedZone  ] = useState(null);
  const [selectedQ,      setSelectedQ     ] = useState(null);
  const [activeTab,      setActiveTab     ] = useState("ataque"); // ataque | defensa | sanciones
  const [team,           setTeam          ] = useState("home");
  const [feedback,       setFeedback      ] = useState(null); // {text, color} flash feedback

  const homePlayers  = homeTeam?.players  || [];
  const awayPlayers  = awayTeam?.players  || [];
  const homeC = homeTeam?.color || R.accent;
  const awayC = "#64748b";

  const currentPlayers = team === "home" ? homePlayers : awayPlayers;

  // Auto-select first player
  useEffect(() => {
    if (currentPlayers.length > 0 && !selectedPlayer) {
      setSelectedPlayer(currentPlayers[0]);
    }
  }, [currentPlayers]);

  // Flash feedback
  const flash = useCallback((text, color) => {
    setFeedback({ text, color });
    setTimeout(() => setFeedback(null), 900);
  }, []);

  // Save event
  const saveEv = useCallback(async (ev) => {
    if (persistEvent) {
      const uuid = await persistEvent(ev).catch(() => null);
      if (uuid && uuid !== ev.id)
        setEvents(prev => prev.map(e => e.id === ev.id ? { ...e, id: uuid } : e));
    }
  }, [persistEvent, setEvents]);

  // Log an event
  const logEvent = useCallback((evType, opts = {}) => {
    const sc = calcNextScore(events, evType, team);
    const shooter = (selectedPlayer && selectedPlayer.id !== "__empty__" && !["exclusion","red_card","yellow_card","timeout"].includes(evType))
      ? { name: selectedPlayer.name, number: selectedPlayer.number }
      : null;
    const ev = {
      id: Date.now(),
      min: realMinute,
      team,
      type: evType,
      zone: selectedZone,
      quadrant: selectedQ,
      shooter,
      goalkeeper: null,
      sanctioned: ["exclusion","red_card","yellow_card"].includes(evType) && shooter ? shooter : null,
      completed: true,
      quickMode: false,
      gkAction: opts.gkAction || null,
      ...sc,
    };
    setEvents(prev => [...prev, ev]);
    saveEv(ev);
    // Visual feedback
    const labels = {
      goal: "⚽ GOL", miss: "❌ Errado", saved: "🧤 Atajada",
      turnover: "🔄 Pérdida", exclusion: "⏱ 2'",
      red_card: "🟥 Roja", yellow_card: "🟨 Amarilla",
    };
    flash(labels[evType] || evType, evType === "goal" ? R.green : evType === "red_card" ? R.red : R.accent);
    // Reset zone/quadrant after each event
    setSelectedZone(null);
    setSelectedQ(null);
  }, [events, team, selectedPlayer, selectedZone, selectedQ, realMinute, setEvents, saveEv, flash]);

  if (matchStatus !== "live") {
    return (
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"70vh", gap:16, padding:20 }}>
        <div style={{ fontSize:52 }}>🤾</div>
        <div style={{ fontSize:18, fontWeight:800, color:R.text }}>Sin partido en curso</div>
        <div style={{ fontSize:13, color:R.muted }}>Iniciá un partido desde la pestaña Partidos</div>
        <button onClick={onStartMatch}
          style={{ background:R.accent, border:"none", color:"#fff", borderRadius:12, padding:"12px 24px", fontSize:14, fontWeight:700, cursor:"pointer" }}>
          + Nuevo partido
        </button>
      </div>
    );
  }

  // ─── LAYOUT ──────────────────────────────────────────────
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 120px)", gap:0, position:"relative", overflow:"hidden" }}>
      <style>{`
        @keyframes flashIn { 0%{opacity:0;transform:scale(.8)} 40%{opacity:1;transform:scale(1.05)} 100%{opacity:0;transform:scale(1)} }
        @keyframes timerPulse { 0%,100%{opacity:1} 50%{opacity:.5} }
      `}</style>

      {/* ── SCORE BAR ── */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"8px 10px", background:"rgba(6,12,24,0.8)",
        borderBottom:`1px solid ${R.border}`, flexShrink:0,
      }}>
        {/* Home */}
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:homeC }} />
          <div>
            <div style={{ fontSize:9, color:R.muted }}>{matchInfo?.home || "Local"}</div>
            <div style={{ fontSize:28, fontWeight:900, color:homeC, lineHeight:1 }}>{score.h}</div>
          </div>
        </div>

        {/* Timer */}
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:20, fontWeight:900, letterSpacing:1, lineHeight:1,
            color: timerSecs === 0 ? R.red : timerRunning ? R.green : R.yellow,
            animation: timerSecs < 60 && timerRunning ? "timerPulse 1s infinite" : "none",
          }}>
            {fmtTime(timerSecs)}
          </div>
          <div style={{ display:"flex", gap:4, justifyContent:"center", marginTop:4 }}>
            <button onClick={onToggleTimer}
              style={{ background: timerRunning ? R.red+"33":"rgba(78,205,196,.2)", border:`1px solid ${timerRunning?R.red:R.green}`, color:timerRunning?R.red:R.green, borderRadius:20, padding:"3px 10px", fontSize:13, cursor:"pointer", fontWeight:700 }}>
              {timerRunning ? "⏸" : "▶"}
            </button>
            {[1,2].map(h => (
              <button key={h} onClick={() => onStartHalf(h)}
                style={{ background: half===h ? R.accent+"33":"transparent", color:half===h?R.accent:R.muted, border:`1px solid ${half===h?R.accent:R.border}`, borderRadius:20, padding:"3px 8px", fontSize:10, cursor:"pointer", fontWeight:700 }}>
                {h}T
              </button>
            ))}
          </div>
        </div>

        {/* Away */}
        <div style={{ display:"flex", alignItems:"center", gap:6, flexDirection:"row-reverse" }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:awayC }} />
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:9, color:R.muted }}>{matchInfo?.away || "Rival"}</div>
            <div style={{ fontSize:28, fontWeight:900, color:awayC, lineHeight:1 }}>{score.a}</div>
          </div>
        </div>

        {/* Close */}
        <button onClick={onCloseMatch}
          style={{ background:"rgba(239,68,68,.15)", border:"1px solid rgba(239,68,68,.4)", color:"#fca5a5", borderRadius:8, padding:"5px 8px", fontSize:10, fontWeight:700, cursor:"pointer" }}>
          🏁
        </button>
      </div>

      {/* ── TEAM SWITCHER ── */}
      <div style={{ display:"flex", gap:4, padding:"6px 8px", background:"rgba(0,0,0,0.3)", flexShrink:0 }}>
        {[{ k:"home", name:matchInfo?.home||"Local", color:homeC }, { k:"away", name:matchInfo?.away||"Rival", color:awayC }].map(t => (
          <button key={t.k} onClick={() => { setTeam(t.k); setSelectedPlayer(null); }}
            style={{ flex:1, background: team===t.k ? t.color+"28" : "transparent", color: team===t.k ? t.color : R.muted, border:`1.5px solid ${team===t.k ? t.color : R.border}`, borderRadius:8, padding:"6px", fontSize:11, fontWeight:700, cursor:"pointer" }}>
            {t.name}
          </button>
        ))}
      </div>

      {/* ── MAIN AREA: left strip + center ── */}
      <div style={{ flex:1, display:"flex", overflow:"hidden", gap:0 }}>

        {/* ── LEFT PLAYER STRIP ── */}
        <div style={{ width:68, overflowY:"auto", flexShrink:0, background:"rgba(4,9,18,0.5)", borderRight:`1px solid ${R.border}`, padding:"4px 3px", display:"flex", flexDirection:"column", gap:3 }}>
          {currentPlayers.length === 0 ? (
            <div style={{ padding:"8px 4px", fontSize:9, color:R.muted, textAlign:"center" }}>Sin plantel</div>
          ) : (
            <>
              {/* Portería vacía always on top */}
              {(() => {
                const p = { id:"__empty__", name:"Portería vacía", number:null, _type:"empty" };
                const sel = selectedPlayer?.id === "__empty__";
                return (
                  <button onClick={() => setSelectedPlayer(p)}
                    style={{ flexShrink:0, width:"100%", minHeight:58, borderRadius:10, border:`1.5px solid ${sel ? R.muted : "rgba(255,255,255,0.07)"}`, background: sel ? "rgba(100,100,100,0.2)" : "transparent", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:2 }}>
                    <div style={{ fontSize:18, color:R.muted }}>⊘</div>
                    <div style={{ fontSize:6.5, color:R.muted, textAlign:"center", lineHeight:1.2 }}>Portería{"\n"}vacía</div>
                  </button>
                );
              })()}

              {/* Goalkeepers first */}
              {currentPlayers.filter(p => p.position === "Arquero" || p.pos === "Arquero").map(p => {
                const sel = selectedPlayer?.id === p.id;
                return (
                  <button key={p.id} onClick={() => setSelectedPlayer(p)}
                    style={{ flexShrink:0, width:"100%", minHeight:58, borderRadius:10, border:`1.5px solid ${sel ? R.accentB : "rgba(255,255,255,0.07)"}`, background: sel ? R.accentB+"22" : "transparent", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:1 }}>
                    <div style={{ fontSize:17, fontWeight:900, color: sel ? R.accentB : R.text }}>{p.number}</div>
                    <div style={{ fontSize:7, color: sel ? R.text : R.muted, textAlign:"center" }}>{p.name?.split(" ")[0]}</div>
                    <div style={{ fontSize:6, color:R.accentB, fontWeight:700 }}>GK</div>
                  </button>
                );
              })}

              {/* Field players */}
              {currentPlayers.filter(p => p.position !== "Arquero" && p.pos !== "Arquero").map(p => {
                const sel = selectedPlayer?.id === p.id;
                return (
                  <button key={p.id} onClick={() => setSelectedPlayer(p)}
                    style={{ flexShrink:0, width:"100%", minHeight:54, borderRadius:10, border:`1.5px solid ${sel ? R.accent : "rgba(255,255,255,0.07)"}`, background: sel ? R.accent+"22" : "transparent", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:1 }}>
                    <div style={{ fontSize:17, fontWeight:900, color: sel ? R.accent : R.text }}>{p.number}</div>
                    <div style={{ fontSize:7, color: sel ? R.text : R.muted, textAlign:"center", maxWidth:60, overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>{p.name?.split(" ")[0]}</div>
                  </button>
                );
              })}
            </>
          )}
        </div>

        {/* ── CENTER CONTENT ── */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>

          {/* GOAL */}
          <div style={{ flexShrink:0, padding:"6px 8px 2px" }}>
            {/* Gol / Guardar el tiro buttons above goal */}
            <div style={{ display:"flex", gap:6, marginBottom:6, justifyContent:"center" }}>
              <button onClick={() => logEvent("goal")}
                style={{ display:"flex", alignItems:"center", gap:5, background:R.accent+"22", border:`2px solid ${R.accent}`, borderRadius:24, padding:"6px 14px", cursor:"pointer", color:R.accent, fontWeight:800, fontSize:12 }}>
                <div style={{ width:14, height:14, borderRadius:"50%", background:R.accent, border:"2px solid rgba(255,255,255,.3)", position:"relative" }}>
                  <div style={{ position:"absolute", inset:2, borderRadius:"50%", background:"rgba(0,0,0,.4)" }}/>
                </div>
                Gol
              </button>
              <button onClick={() => logEvent("saved")}
                style={{ display:"flex", alignItems:"center", gap:5, background:R.accentB+"22", border:`2px solid ${R.accentB}`, borderRadius:24, padding:"6px 14px", cursor:"pointer", color:R.accentB, fontWeight:800, fontSize:12 }}>
                <div style={{ width:14, height:14, borderRadius:"50%", background:R.accentB, border:"2px solid rgba(255,255,255,.3)", position:"relative" }}>
                  <div style={{ position:"absolute", inset:2, borderRadius:"50%", background:"rgba(0,0,0,.4)" }}/>
                </div>
                Guardar el tiro
              </button>
            </div>
            <HandballGoal selectedQ={selectedQ} onSelectQ={setSelectedQ} />
          </div>

          {/* SEPARATOR BAND */}
          <div style={{
            background:"#1565a0", padding:"5px 12px", flexShrink:0,
            display:"flex", alignItems:"center", justifyContent:"space-between",
          }}>
            <span style={{ fontSize:13, fontWeight:700, color:"#7dd3fc", letterSpacing:.5 }}>
              Interrupción de juego
            </span>
            {selectedZone && (
              <span style={{ fontSize:10, color:"rgba(255,255,255,.6)", fontWeight:600 }}>
                Zona: {COURT_ZONES[selectedZone]?.label}
              </span>
            )}
          </div>

          {/* COURT */}
          <div style={{ padding:"4px 8px", flexShrink:0 }}>
            <CourtZones selectedZone={selectedZone} onSelectZone={setSelectedZone} />
          </div>

          {/* SELECTED PLAYER INFO */}
          <div style={{
            padding:"4px 10px", flexShrink:0,
            display:"flex", alignItems:"center", justifyContent:"space-between",
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              {selectedPlayer && selectedPlayer.id !== "__empty__" ? (
                <>
                  <div style={{ width:28, height:28, borderRadius:"50%", background: R.accent+"33", border:`1.5px solid ${R.accent}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <span style={{ fontSize:10, fontWeight:900, color:R.accent }}>{selectedPlayer.number}</span>
                  </div>
                  <span style={{ fontSize:12, fontWeight:700, color:R.text }}>{selectedPlayer.name}</span>
                </>
              ) : (
                <span style={{ fontSize:12, color:R.muted }}>⊘ Portería vacía</span>
              )}
            </div>
            <span style={{ fontSize:10, color:R.muted }}>min {realMinute}'</span>
          </div>

          {/* TABS */}
          <div style={{ display:"flex", gap:0, flexShrink:0, borderTop:`1px solid ${R.border}`, borderBottom:`1px solid ${R.border}` }}>
            {[
              { k:"sanciones", l:"Sanciones" },
              { k:"ataque",    l:"Ataque"    },
              { k:"defensa",   l:"Defensa"   },
            ].map(t => (
              <button key={t.k} onClick={() => setActiveTab(t.k)}
                style={{
                  flex:1, background: activeTab===t.k ? R.accent : "transparent",
                  color: activeTab===t.k ? "#fff" : R.muted,
                  border:"none", padding:"9px 4px",
                  fontSize:11, fontWeight:700, cursor:"pointer",
                  borderBottom: activeTab===t.k ? `2px solid ${R.accent}` : "2px solid transparent",
                  transition:"all .15s",
                }}>
                {t.l}
              </button>
            ))}
          </div>

          {/* ACTION BUTTONS */}
          <div style={{ flex:1, overflowY:"auto", padding:"8px 8px" }}>

            {/* ATAQUE */}
            {activeTab === "ataque" && (
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {ATTACK_ACTIONS.map(a => (
                  <button key={a.k} onClick={() => logEvent(a.evType)}
                    style={{
                      display:"flex", alignItems:"center", justifyContent:"space-between",
                      background: a.good === true ? R.green+"22" : a.good === false ? R.red+"22" : "rgba(100,100,100,.15)",
                      border:`1.5px solid ${a.good === true ? R.green : a.good === false ? R.red : R.border}`,
                      borderRadius:24, padding:"11px 16px", cursor:"pointer", width:"100%",
                    }}>
                    <span style={{ fontSize:12, color:R.text, fontWeight:600 }}>{a.l}</span>
                    <div style={{
                      background: a.good === true ? R.green : a.good === false ? R.red : R.muted,
                      borderRadius:16, padding:"5px 12px", minWidth:48, display:"flex", alignItems:"center", justifyContent:"center",
                    }}>
                      <span style={{ fontSize:11, color:"#fff", fontWeight:700 }}>{a.icon}</span>
                    </div>
                  </button>
                ))}
                {/* Miss also here */}
                <button onClick={() => logEvent("miss")}
                  style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"rgba(100,100,100,.1)", border:`1px solid ${R.border}`, borderRadius:24, padding:"10px 16px", cursor:"pointer" }}>
                  <span style={{ fontSize:12, color:R.muted }}>Tiro errado</span>
                  <div style={{ background:R.muted, borderRadius:16, padding:"5px 12px" }}>
                    <span style={{ fontSize:11, color:"#fff" }}>❌</span>
                  </div>
                </button>
              </div>
            )}

            {/* DEFENSA */}
            {activeTab === "defensa" && (
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {GK_ACTIONS.map(a => (
                  <button key={a.k} onClick={() => logEvent("saved", { gkAction: a.k })}
                    style={{
                      display:"flex", alignItems:"center", justifyContent:"space-between",
                      background: a.good ? R.green+"22" : R.red+"22",
                      border:`1.5px solid ${a.good ? R.green : R.red}`,
                      borderRadius:24, padding:"10px 14px", cursor:"pointer", width:"100%",
                    }}>
                    <span style={{ fontSize:11, color:R.text, fontWeight:600, textAlign:"left", flex:1 }}>{a.l}</span>
                    <div style={{ background: a.good ? R.green : R.red, borderRadius:16, padding:"5px 14px", minWidth:48, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <span style={{ fontSize:13 }}>{a.icon}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* SANCIONES */}
            {activeTab === "sanciones" && (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {SANCTION_ACTIONS.map(a => (
                  <button key={a.k} onClick={() => logEvent(a.evType)}
                    style={{
                      display:"flex", alignItems:"center", justifyContent:"space-between",
                      background: a.color+"22", border:`1.5px solid ${a.color}`,
                      borderRadius:24, padding:"13px 18px", cursor:"pointer", width:"100%",
                    }}>
                    <div style={{ width:44, height:26, borderRadius:8, background:a.color, opacity:0.9 }}/>
                    <span style={{ fontSize:13, color:R.text, fontWeight:700 }}>{a.l}</span>
                  </button>
                ))}
                {selectedPlayer && selectedPlayer.id !== "__empty__" && (
                  <div style={{ background:"rgba(255,255,255,.05)", borderRadius:10, padding:"8px 12px", border:`1px solid ${R.border}` }}>
                    <span style={{ fontSize:11, color:R.muted }}>Sancionado: </span>
                    <span style={{ fontSize:11, color:R.text, fontWeight:700 }}>
                      {selectedPlayer.number} {selectedPlayer.name}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FLASH FEEDBACK OVERLAY */}
      {feedback && (
        <div style={{
          position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center",
          pointerEvents:"none", zIndex:100,
        }}>
          <div style={{
            background: feedback.color + "ee",
            borderRadius:20, padding:"16px 32px",
            fontSize:22, fontWeight:900, color:"#fff",
            animation:"flashIn .9s ease forwards",
            boxShadow:`0 0 40px ${feedback.color}88`,
          }}>
            {feedback.text}
          </div>
        </div>
      )}
    </div>
  );
}
