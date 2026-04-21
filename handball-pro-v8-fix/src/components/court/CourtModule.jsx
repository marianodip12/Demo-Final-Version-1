/**
 * CourtModule v3
 * ── Arco compacto (320×140) + botones FUERA y PALO fuera del SVG
 * ── Cancha SVG con 8 zonas + 7m
 * ── Heatmap por equipo separado
 */
import { useState, useCallback } from "react";

// ── Zone mappings ─────────────────────────────────────────────
const ZONE_MAP = {
  1:"extreme_left", 2:"lateral_left",  3:"center_above",
  4:"lateral_right",5:"extreme_right", 6:"7m",
  7:"near_left",    8:"near_center",   9:"near_right",
};
const ZONE_NAMES = {
  1:"Ext. Izq.", 2:"Lat. Izq.", 3:"Centro",
  4:"Lat. Der.", 5:"Ext. Der.", 6:"7m",
  7:"Cerca Izq.",8:"Pivote",   9:"Cerca Der.",
};
const GOAL_NAMES = {
  0:"Arr. Izq.",  1:"Arr. Centro", 2:"Arr. Der.",
  3:"Med. Izq.",  4:"Med. Centro", 5:"Med. Der.",
  6:"Abj. Izq.",  7:"Abj. Centro", 8:"Abj. Der.",
  palo:"Palo / Travesaño", fuera:"Fuera del arco",
};

// ── Fill helpers ──────────────────────────────────────────────
function courtFill(z, sel, heat) {
  if (sel === z) return "rgba(200,168,42,0.75)";
  const v = heat?.[ZONE_MAP[z]] ?? 0;
  if (v > 0) {
    const maxV = Math.max(...Object.values(heat || {}).filter(Number), 1);
    return `rgba(239,100,97,${0.18 + (v / maxV) * 0.48})`;
  }
  return "transparent";
}

function goalFill(gz, sel, byQ) {
  if (sel === gz) return "rgba(200,168,42,0.65)";
  const q = byQ?.find(q => q.id === gz);
  if (q?.total > 0) {
    const maxT = Math.max(...(byQ||[]).map(q=>q.total), 1);
    return `rgba(239,100,97,${0.13 + (q.total / maxT) * 0.44})`;
  }
  return "rgba(255,255,255,0.04)";
}

// ── Goal SVG — viewBox 0 0 320 140 (igual a court.html) ──────
// Crossbar at y=8, posts x=5 and x=315, interior x=6..314 y=9..139
// 3 cols ×3 rows = 9 cuadrantes
// Encima del SVG (como elemento React) van los botones FUERA y PALO
function GoalSVG({ sel, onSel, byQ }) {
  const s = gz => onSel(sel === gz ? null : gz);

  // 3 columnas: 6..108 | 109..211 | 212..314  (width≈102 each)
  const GX=[6, 109, 212], GW=[102, 102, 102];
  // 3 filas: 9..52 | 53..96 | 97..139 (height=43 each)
  const GY=[9, 53, 97], GH=43;
  const z9=[
    {gz:0,c:0,r:0},{gz:1,c:1,r:0},{gz:2,c:2,r:0},
    {gz:3,c:0,r:1},{gz:4,c:1,r:1},{gz:5,c:2,r:1},
    {gz:6,c:0,r:2},{gz:7,c:1,r:2},{gz:8,c:2,r:2},
  ];

  return (
    <svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg"
      style={{width:"100%",display:"block",touchAction:"manipulation"}}
      preserveAspectRatio="xMidYMid meet">

      {/* Goal interior background */}
      <rect x="6" y="8" width="308" height="132" fill="#0d2240"/>

      {/* Main grid dividers */}
      <line x1="6"   y1="52"  x2="314" y2="52"  stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
      <line x1="6"   y1="96"  x2="314" y2="96"  stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
      <line x1="108" y1="8"   x2="108" y2="140" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
      <line x1="211" y1="8"   x2="211" y2="140" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
      {/* Fine net texture */}
      {[56,160,265].map(x=><line key={x} x1={x} y1="8" x2={x} y2="140" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>)}
      {[30,74,118].map(y=><line key={y} x1="6" y1={y} x2="314" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>)}

      {/* 9 inner zones */}
      {z9.map(({gz,c,r})=>{
        const x=GX[c], y=GY[r], w=GW[c], h=GH;
        const q=byQ?.find(q=>q.id===gz);
        const isSel=sel===gz;
        return (
          <g key={gz} onClick={()=>s(gz)} style={{cursor:"pointer"}}>
            <rect x={x} y={y} width={w} height={h} rx="2"
              fill={goalFill(gz,sel,byQ)}
              stroke={isSel?"#c8a82a":"rgba(255,255,255,0.14)"}
              strokeWidth={isSel?2:1}/>
            {q?.total>0 &&
              <text x={x+w/2} y={y+h/2+5} textAnchor="middle" fill="#fff"
                fontSize="15" fontWeight="bold" fontFamily="Arial,sans-serif"
                style={{pointerEvents:"none"}}>{q.total}</text>}
            {isSel &&
              <text x={x+w/2} y={y+h/2+5} textAnchor="middle" fill="#ffe"
                fontSize="9" fontWeight="700" fontFamily="Arial,sans-serif"
                style={{pointerEvents:"none"}}>{GOAL_NAMES[gz]}</text>}
          </g>
        );
      })}

      {/* PALO click zones — over the red frame lines */}
      {/* Crossbar strip */}
      <rect x="0" y="2" width="320" height="10"
        fill={sel==="palo"?"rgba(255,230,80,0.45)":"rgba(0,0,0,0)"}
        style={{cursor:"pointer"}} onClick={()=>s("palo")}/>
      {/* Left post */}
      <rect x="0" y="8" width="10" height="132"
        fill={sel==="palo"?"rgba(255,230,80,0.45)":"rgba(0,0,0,0)"}
        style={{cursor:"pointer"}} onClick={()=>s("palo")}/>
      {/* Right post */}
      <rect x="310" y="8" width="10" height="132"
        fill={sel==="palo"?"rgba(255,230,80,0.45)":"rgba(0,0,0,0)"}
        style={{cursor:"pointer"}} onClick={()=>s("palo")}/>

      {/* Goal frame drawn on top */}
      <line x1="0"   y1="8" x2="320" y2="8"   stroke="#e8453c" strokeWidth="6" strokeLinecap="round"/>
      <line x1="5"   y1="8" x2="5"   y2="140" stroke="#e8453c" strokeWidth="6" strokeLinecap="round"/>
      <line x1="315" y1="8" x2="315" y2="140" stroke="#e8453c" strokeWidth="6" strokeLinecap="round"/>

      {/* PALO highlight label */}
      {sel==="palo" &&
        <text x="160" y="6.5" textAnchor="middle" fill="#ffe650"
          fontSize="6" fontWeight="800" fontFamily="Arial,sans-serif"
          style={{pointerEvents:"none",letterSpacing:1}}>PALO / TRAVESAÑO</text>}
    </svg>
  );
}

// ── Court SVG ─────────────────────────────────────────────────
function CourtSVG({ sel, onSel, heat }) {
  const s = z => onSel(sel === z ? null : z);
  const f = z => courtFill(z, sel, heat);
  return (
    <svg viewBox="0 0 360 300" preserveAspectRatio="xMidYMid meet"
      style={{width:"100%",height:"100%",display:"block",touchAction:"manipulation"}}>
      <defs>
        <clipPath id="cv3-aL"><path d="M 65 0 L 148 0 L 148 174 Q 106 158 65 132 Z"/></clipPath>
        <clipPath id="cv3-aC"><path d="M 148 0 L 212 0 L 212 174 L 148 174 Z"/></clipPath>
        <clipPath id="cv3-aR"><path d="M 212 0 L 295 0 L 295 132 Q 254 158 212 174 Z"/></clipPath>
        <clipPath id="cv3-bL"><path d="M 65 132 Q 106 158 148 174 L 148 300 L 65 300 Z"/></clipPath>
        <clipPath id="cv3-bC"><path d="M 148 174 L 212 174 L 212 300 L 148 300 Z"/></clipPath>
        <clipPath id="cv3-bR"><path d="M 212 174 Q 254 158 295 132 L 295 300 L 212 300 Z"/></clipPath>
      </defs>
      <rect width="360" height="300" fill="#0b1a2e"/>
      {/* Zones */}
      <rect onClick={()=>s(1)} style={{cursor:"pointer"}} x="0"   y="0" width="65"  height="117" fill={f(1)} stroke={sel===1?"#c8a82a":"transparent"} strokeWidth="2"/>
      <rect onClick={()=>s(2)} style={{cursor:"pointer"}} x="65"  y="0" width="83"  height="300" clipPath="url(#cv3-aL)" fill={f(2)} stroke={sel===2?"#c8a82a":"transparent"} strokeWidth="2"/>
      <rect onClick={()=>s(3)} style={{cursor:"pointer"}} x="148" y="0" width="64"  height="300" clipPath="url(#cv3-aC)" fill={f(3)} stroke={sel===3?"#c8a82a":"transparent"} strokeWidth="2"/>
      <rect onClick={()=>s(4)} style={{cursor:"pointer"}} x="212" y="0" width="83"  height="300" clipPath="url(#cv3-aR)" fill={f(4)} stroke={sel===4?"#c8a82a":"transparent"} strokeWidth="2"/>
      <rect onClick={()=>s(5)} style={{cursor:"pointer"}} x="295" y="0" width="65"  height="117" fill={f(5)} stroke={sel===5?"#c8a82a":"transparent"} strokeWidth="2"/>
      <rect onClick={()=>s(7)} style={{cursor:"pointer"}} x="65"  y="0" width="83"  height="300" clipPath="url(#cv3-bL)" fill={f(7)} stroke={sel===7?"#c8a82a":"transparent"} strokeWidth="2"/>
      <rect onClick={()=>s(8)} style={{cursor:"pointer"}} x="148" y="0" width="64"  height="300" clipPath="url(#cv3-bC)" fill={f(8)} stroke={sel===8?"#c8a82a":"transparent"} strokeWidth="2"/>
      <rect onClick={()=>s(9)} style={{cursor:"pointer"}} x="212" y="0" width="83"  height="300" clipPath="url(#cv3-bR)" fill={f(9)} stroke={sel===9?"#c8a82a":"transparent"} strokeWidth="2"/>
      {/* Court lines */}
      <path d="M 0 0 Q 180 210 360 0 L 360 -2 L 0 -2 Z" fill="#1a3d7a" opacity="0.9"/>
      <path d="M 0 0 Q 180 210 360 0" fill="none" stroke="#fff" strokeWidth="2.5"/>
      <path d="M 0 65 Q 180 290 360 65" fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="10,7"/>
      <line x1="65"  y1="62"  x2="65"  y2="300" stroke="#fff" strokeWidth="1.5" opacity="0.45"/>
      <line x1="148" y1="102" x2="148" y2="300" stroke="#fff" strokeWidth="1.5" opacity="0.45"/>
      <line x1="212" y1="102" x2="212" y2="300" stroke="#fff" strokeWidth="1.5" opacity="0.45"/>
      <line x1="295" y1="62"  x2="295" y2="300" stroke="#fff" strokeWidth="1.5" opacity="0.45"/>
      {/* Heatmap counts */}
      {[[1,32,80],[2,106,80],[3,180,65],[4,254,80],[5,328,80],[7,106,210],[8,180,240],[9,254,210]].map(([z,x,y])=>{
        const v=heat?.[ZONE_MAP[z]]; if(!v) return null;
        return <text key={z} x={x} y={y} textAnchor="middle" fill="#fff"
          fontSize="16" fontWeight="bold" fontFamily="Arial,sans-serif"
          style={{pointerEvents:"none"}}>{v}</text>;
      })}
      {/* 7m badge */}
      <g onClick={()=>s(6)} style={{cursor:"pointer"}}>
        <rect x="148" y="125" width="64" height="24" rx="12" fill={sel===6?"#c8a82a":"#fff"}/>
        <text x="180" y="141" textAnchor="middle" fill={sel===6?"#fff":"#0b1a2e"}
          fontFamily="Arial,sans-serif" fontSize="12" fontWeight="800" style={{pointerEvents:"none"}}>7m</text>
      </g>
    </svg>
  );
}

// ── Result Overlay ────────────────────────────────────────────
function Overlay({cz, gz, onOk, onCancel, team, homeTeam, awayTeam}) {
  if (cz===null || gz===null) return null;
  const isFuera=gz==="fuera", isPalo=gz==="palo";
  const zoneName=ZONE_NAMES[cz]??String(cz);
  const goalName=GOAL_NAMES[gz]??String(gz);
  const teamName =team==="home"?(homeTeam?.short_name??homeTeam?.name??"Local"):(awayTeam?.short_name??awayTeam?.name??"Visitante");
  const tColor   =team==="home"?(homeTeam?.color??"#ef6461"):(awayTeam?.color??"#48cae4");
  const Btn=({onClick,bg,emoji,label})=>(
    <button onClick={onClick} style={{
      padding:"14px 10px",borderRadius:10,border:"none",fontSize:15,fontWeight:800,
      cursor:"pointer",background:bg,color:"#fff",WebkitTapHighlightColor:"transparent",
      touchAction:"manipulation",display:"flex",alignItems:"center",justifyContent:"center",gap:6,
    }}>{emoji} {label}</button>
  );
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.72)",zIndex:300,
      display:"flex",alignItems:"center",justifyContent:"center",touchAction:"none"}}>
      <div style={{background:"#132a4e",borderRadius:18,padding:"18px 22px",
        display:"flex",flexDirection:"column",gap:10,minWidth:220,maxWidth:280,
        boxShadow:"0 12px 48px rgba(0,0,0,0.7)"}}>
        <div style={{textAlign:"center",fontSize:11,fontWeight:800,padding:"5px 10px",
          borderRadius:8,background:tColor+"33",color:tColor,border:`1px solid ${tColor}55`}}>
          ⚡ {teamName}
        </div>
        <p style={{textAlign:"center",fontSize:11,color:"#aaa",fontWeight:600,margin:0}}>
          {zoneName} → {goalName}
        </p>
        {isFuera ? <Btn onClick={()=>onOk("miss")} bg="#555"    emoji="✕"  label="Errado / Fuera"/>
        : isPalo  ? <Btn onClick={()=>onOk("post")} bg="#b45309" emoji="🔴" label="Palo / Travesaño"/>
        : (<>
            <Btn onClick={()=>onOk("goal")}  bg="#e8453c" emoji="⚽" label="Gol"/>
            <Btn onClick={()=>onOk("saved")} bg="#2ecfb0" emoji="🧤" label="Atajado"/>
          </>)}
        <button onClick={onCancel} style={{padding:"9px",borderRadius:10,border:"none",
          fontSize:12,fontWeight:600,cursor:"pointer",background:"#1a3a60",color:"#aaa"}}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────
export default function CourtModule({
  onRegister,
  homeHeatCounts={}, awayHeatCounts={},
  homeByQuadrant=[],  awayByQuadrant=[],
  activeTeam="home",
  homeTeam, awayTeam,
  onTeamChange,
}) {
  const [cz, setCz] = useState(null); // court zone (1-9 numeric)
  const [gz, setGz] = useState(null); // goal zone (0-8 | "palo" | "fuera")

  const heat = activeTeam==="home" ? homeHeatCounts : awayHeatCounts;
  const byQ  = activeTeam==="home" ? homeByQuadrant : awayByQuadrant;

  const confirm = useCallback((type) => {
    const zone     = ZONE_MAP[cz] ?? String(cz);
    const quadrant = typeof gz === "number" ? gz : null;
    onRegister?.({ zone, quadrant, goalSection: gz, type });
    setCz(null); setGz(null);
  }, [cz, gz, onRegister]);

  const homeName  = homeTeam?.short_name ?? homeTeam?.name  ?? "Local";
  const awayName  = awayTeam?.short_name ?? awayTeam?.name  ?? "Visitante";
  const homeColor = homeTeam?.color ?? "#ef6461";
  const awayColor = awayTeam?.color ?? "#48cae4";

  return (
    <div style={{display:"flex",flexDirection:"column",gap:0}}>

      {/* ── Team selector ── */}
      {onTeamChange && (
        <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:6}}>
          <span style={{fontSize:9,color:"#555",textTransform:"uppercase",letterSpacing:1.5,whiteSpace:"nowrap"}}>
            Ataca:
          </span>
          {[["home",homeName,homeColor],["away",awayName,awayColor]].map(([side,name,color])=>(
            <button key={side} onClick={()=>onTeamChange(side)} style={{
              flex:1,padding:"7px 8px",borderRadius:8,fontSize:11,fontWeight:800,
              cursor:"pointer",WebkitTapHighlightColor:"transparent",touchAction:"manipulation",
              background:activeTeam===side?color:"rgba(255,255,255,0.06)",
              color:activeTeam===side?"#fff":"#888",
              border:`1.5px solid ${activeTeam===side?color:"rgba(255,255,255,0.1)"}`,
            }}>{name}</button>
          ))}
        </div>
      )}

      {/* ── Module 1: Goal grid + FUERA/PALO buttons ── */}
      <div style={{background:"#0a1e3a",borderRadius:"12px 12px 0 0",
        padding:"6px 10px 6px",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <div style={{fontSize:8,color:"#4a5568",textTransform:"uppercase",letterSpacing:1.5,marginBottom:4}}>
          Sección del arco
        </div>

        {/* FUERA + PALO buttons above the goal */}
        <div style={{display:"flex",gap:5,marginBottom:5}}>
          <button onClick={()=>setGz(gz==="fuera"?null:"fuera")} style={{
            flex:1,padding:"5px 6px",borderRadius:7,border:"none",fontSize:11,fontWeight:800,
            cursor:"pointer",WebkitTapHighlightColor:"transparent",touchAction:"manipulation",
            background: gz==="fuera" ? "rgba(100,100,100,0.8)" : "rgba(255,255,255,0.07)",
            color: gz==="fuera" ? "#fff" : "#888",
            outline: gz==="fuera" ? "1.5px solid #aaa" : "none",
          }}>
            ✕ Fuera / Errado
          </button>
          <button onClick={()=>setGz(gz==="palo"?null:"palo")} style={{
            flex:1,padding:"5px 6px",borderRadius:7,border:"none",fontSize:11,fontWeight:800,
            cursor:"pointer",WebkitTapHighlightColor:"transparent",touchAction:"manipulation",
            background: gz==="palo" ? "rgba(180,83,9,0.85)" : "rgba(255,255,255,0.07)",
            color: gz==="palo" ? "#fff" : "#888",
            outline: gz==="palo" ? "1.5px solid #f97316" : "none",
          }}>
            🔴 Palo / Travesaño
          </button>
        </div>

        {/* Goal SVG */}
        <GoalSVG sel={gz} onSel={setGz} byQ={byQ}/>
      </div>

      {/* ── Module 2: Court ── */}
      <div style={{background:"#0b1a2e",borderRadius:"0 0 12px 12px",
        padding:"4px 10px 8px",border:"1px solid rgba(255,255,255,0.06)",borderTop:"none"}}>
        <div style={{fontSize:8,color:"#4a5568",textTransform:"uppercase",letterSpacing:1.5,marginBottom:3}}>
          Zona de tiro
        </div>
        <div style={{height:185}}>
          <CourtSVG sel={cz} onSel={setCz} heat={heat}/>
        </div>
      </div>

      {/* ── Overlay ── */}
      {cz!==null && gz!==null && (
        <Overlay cz={cz} gz={gz} onOk={confirm} onCancel={()=>setGz(null)}
          team={activeTeam} homeTeam={homeTeam} awayTeam={awayTeam}/>
      )}
    </div>
  );
}
