/**
 * CourtModule v2 — Arco + Cancha.
 * Zonas: 0-8 cuadrantes | "palo" | "fuera" (errado)
 * Heatmap por equipo separado.
 */
import { useState, useCallback } from "react";

const ZONE_MAP = {
  1:"extreme_left", 2:"lateral_left", 3:"center_above",
  4:"lateral_right", 5:"extreme_right", 6:"7m",
  7:"near_left", 8:"near_center", 9:"near_right",
};
const ZONE_NAMES = {
  1:"Ext. Izq.", 2:"Lat. Izq.", 3:"Centro",
  4:"Lat. Der.", 5:"Ext. Der.", 6:"7m",
  7:"Cerca Izq.", 8:"Pivote", 9:"Cerca Der.",
};
const GOAL_ZONE_NAMES = {
  0:"Arr. Izq.", 1:"Arr. Centro", 2:"Arr. Der.",
  3:"Med. Izq.", 4:"Med. Centro", 5:"Med. Der.",
  6:"Abj. Izq.", 7:"Abj. Centro", 8:"Abj. Der.",
  palo:"Palo / Travesaño", fuera:"Fuera del arco",
};

function courtFill(z, sel, heat) {
  const key = ZONE_MAP[z];
  if (sel === z) return "rgba(200,168,42,0.75)";
  const v = heat?.[key] ?? 0;
  if (v > 0) {
    const maxV = Math.max(...Object.values(heat || {}), 1);
    return `rgba(239,100,97,${0.15 + (v / maxV) * 0.5})`;
  }
  return "transparent";
}

function goalFill(gz, sel, byQ) {
  if (gz === "palo")  return sel === "palo"  ? "rgba(255,230,80,0.35)" : "rgba(0,0,0,0)";
  if (gz === "fuera") return sel === "fuera" ? "rgba(90,90,90,0.5)"   : "rgba(0,0,0,0)";
  if (sel === gz) return "rgba(200,168,42,0.65)";
  const q = byQ?.find(q => q.id === gz);
  if (q?.total > 0) {
    const maxT = Math.max(...(byQ || []).map(q => q.total), 1);
    return `rgba(239,100,97,${0.12 + (q.total / maxT) * 0.45})`;
  }
  return "rgba(255,255,255,0.04)";
}

// ── Goal SVG ─────────────────────────────────────────────────
// viewBox 0 0 340 168. Goal interior: x10..330 y16..168
function GoalSVG({ sel, onSel, byQ }) {
  const s = gz => onSel(sel === gz ? null : gz);
  const GX=[11,117,224], GW=[104,105,104], GY=[17,66,115], GH=47;
  const z9=[
    {gz:0,c:0,r:0},{gz:1,c:1,r:0},{gz:2,c:2,r:0},
    {gz:3,c:0,r:1},{gz:4,c:1,r:1},{gz:5,c:2,r:1},
    {gz:6,c:0,r:2},{gz:7,c:1,r:2},{gz:8,c:2,r:2},
  ];
  return (
    <svg viewBox="0 0 340 168" style={{ width:"100%", display:"block", touchAction:"manipulation" }}
      preserveAspectRatio="xMidYMid meet">
      {/* FUERA background */}
      <rect x="0" y="0" width="340" height="168"
        fill={sel==="fuera"?"rgba(80,80,80,0.5)":"rgba(20,20,40,0.8)"}
        style={{cursor:"pointer"}} onClick={() => s("fuera")} />
      <text x="170" y="12" textAnchor="middle"
        fill={sel==="fuera"?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.22)"}
        fontSize="8" fontWeight="800" fontFamily="Arial,sans-serif"
        style={{pointerEvents:"none",letterSpacing:2}}>
        {sel==="fuera"?"✕ ERRADO — FUERA DEL ARCO":"FUERA / ERRADO"}
      </text>
      {/* Goal interior */}
      <rect x="10" y="16" width="320" height="152" fill="#0d2240" />
      {/* Grid */}
      <line x1="10"  y1="63"  x2="330" y2="63"  stroke="rgba(255,255,255,0.18)" strokeWidth="1.5"/>
      <line x1="10"  y1="112" x2="330" y2="112" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5"/>
      <line x1="115" y1="16"  x2="115" y2="168" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5"/>
      <line x1="222" y1="16"  x2="222" y2="168" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5"/>
      <line x1="62"  y1="16" x2="62"  y2="168" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
      <line x1="170" y1="16" x2="170" y2="168" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
      <line x1="276" y1="16" x2="276" y2="168" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
      <line x1="10"  y1="40" x2="330" y2="40"  stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
      <line x1="10"  y1="88" x2="330" y2="88"  stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
      <line x1="10"  y1="136" x2="330" y2="136" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
      {/* 9 inner zones */}
      {z9.map(({gz,c,r}) => {
        const x=GX[c], y=GY[r], w=GW[c], h=GH;
        const q=byQ?.find(q=>q.id===gz);
        const isSel=sel===gz;
        return (
          <g key={gz} onClick={e=>{e.stopPropagation();s(gz);}} style={{cursor:"pointer"}}>
            <rect x={x} y={y} width={w} height={h} rx="2"
              fill={goalFill(gz,sel,byQ)}
              stroke={isSel?"#c8a82a":"rgba(255,255,255,0.15)"}
              strokeWidth={isSel?2:1}/>
            {q?.total>0 && (
              <text x={x+w/2} y={y+h/2+5} textAnchor="middle" fill="#fff"
                fontSize="14" fontWeight="bold" fontFamily="Arial,sans-serif"
                style={{pointerEvents:"none"}}>{q.total}</text>
            )}
          </g>
        );
      })}
      {/* PALO click zones — on posts and crossbar */}
      <rect x="10" y="10" width="320" height="12"
        fill={sel==="palo"?"rgba(255,230,80,0.4)":"rgba(0,0,0,0)"}
        style={{cursor:"pointer"}}
        onClick={e=>{e.stopPropagation();s("palo");}}/>
      <rect x="4" y="16" width="13" height="152"
        fill={sel==="palo"?"rgba(255,230,80,0.4)":"rgba(0,0,0,0)"}
        style={{cursor:"pointer"}}
        onClick={e=>{e.stopPropagation();s("palo");}}/>
      <rect x="323" y="16" width="13" height="152"
        fill={sel==="palo"?"rgba(255,230,80,0.4)":"rgba(0,0,0,0)"}
        style={{cursor:"pointer"}}
        onClick={e=>{e.stopPropagation();s("palo");}}/>
      {/* Goal frame (on top) */}
      <line x1="0"   y1="16" x2="340" y2="16"  stroke="#e8453c" strokeWidth="8" strokeLinecap="round"/>
      <line x1="10"  y1="16" x2="10"  y2="168" stroke="#e8453c" strokeWidth="8" strokeLinecap="round"/>
      <line x1="330" y1="16" x2="330" y2="168" stroke="#e8453c" strokeWidth="8" strokeLinecap="round"/>
      {sel==="palo" && (
        <text x="170" y="13" textAnchor="middle" fill="#ffe650"
          fontSize="7.5" fontWeight="800" fontFamily="Arial,sans-serif"
          style={{pointerEvents:"none",letterSpacing:1}}>PALO / TRAVESAÑO</text>
      )}
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
        <clipPath id="cm2-aL"><path d="M 65 0 L 148 0 L 148 174 Q 106 158 65 132 Z"/></clipPath>
        <clipPath id="cm2-aC"><path d="M 148 0 L 212 0 L 212 174 L 148 174 Z"/></clipPath>
        <clipPath id="cm2-aR"><path d="M 212 0 L 295 0 L 295 132 Q 254 158 212 174 Z"/></clipPath>
        <clipPath id="cm2-bL"><path d="M 65 132 Q 106 158 148 174 L 148 300 L 65 300 Z"/></clipPath>
        <clipPath id="cm2-bC"><path d="M 148 174 L 212 174 L 212 300 L 148 300 Z"/></clipPath>
        <clipPath id="cm2-bR"><path d="M 212 174 Q 254 158 295 132 L 295 300 L 212 300 Z"/></clipPath>
      </defs>
      <rect width="360" height="300" fill="#0b1a2e"/>
      <rect onClick={()=>s(1)} style={{cursor:"pointer"}} x="0"   y="0" width="65"  height="117" fill={f(1)} stroke={sel===1?"#c8a82a":"transparent"} strokeWidth="2"/>
      <rect onClick={()=>s(2)} style={{cursor:"pointer"}} x="65"  y="0" width="83"  height="300" clipPath="url(#cm2-aL)" fill={f(2)} stroke={sel===2?"#c8a82a":"transparent"} strokeWidth="2"/>
      <rect onClick={()=>s(3)} style={{cursor:"pointer"}} x="148" y="0" width="64"  height="300" clipPath="url(#cm2-aC)" fill={f(3)} stroke={sel===3?"#c8a82a":"transparent"} strokeWidth="2"/>
      <rect onClick={()=>s(4)} style={{cursor:"pointer"}} x="212" y="0" width="83"  height="300" clipPath="url(#cm2-aR)" fill={f(4)} stroke={sel===4?"#c8a82a":"transparent"} strokeWidth="2"/>
      <rect onClick={()=>s(5)} style={{cursor:"pointer"}} x="295" y="0" width="65"  height="117" fill={f(5)} stroke={sel===5?"#c8a82a":"transparent"} strokeWidth="2"/>
      <rect onClick={()=>s(7)} style={{cursor:"pointer"}} x="65"  y="0" width="83"  height="300" clipPath="url(#cm2-bL)" fill={f(7)} stroke={sel===7?"#c8a82a":"transparent"} strokeWidth="2"/>
      <rect onClick={()=>s(8)} style={{cursor:"pointer"}} x="148" y="0" width="64"  height="300" clipPath="url(#cm2-bC)" fill={f(8)} stroke={sel===8?"#c8a82a":"transparent"} strokeWidth="2"/>
      <rect onClick={()=>s(9)} style={{cursor:"pointer"}} x="212" y="0" width="83"  height="300" clipPath="url(#cm2-bR)" fill={f(9)} stroke={sel===9?"#c8a82a":"transparent"} strokeWidth="2"/>
      <path d="M 0 0 Q 180 210 360 0 L 360 -2 L 0 -2 Z" fill="#1a3d7a" opacity="0.9"/>
      <path d="M 0 0 Q 180 210 360 0" fill="none" stroke="#fff" strokeWidth="2.5"/>
      <path d="M 0 65 Q 180 290 360 65" fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="10,7"/>
      <line x1="65"  y1="62"  x2="65"  y2="300" stroke="#fff" strokeWidth="1.5" opacity="0.45"/>
      <line x1="148" y1="102" x2="148" y2="300" stroke="#fff" strokeWidth="1.5" opacity="0.45"/>
      <line x1="212" y1="102" x2="212" y2="300" stroke="#fff" strokeWidth="1.5" opacity="0.45"/>
      <line x1="295" y1="62"  x2="295" y2="300" stroke="#fff" strokeWidth="1.5" opacity="0.45"/>
      {[[1,32,80],[2,106,80],[3,180,65],[4,254,80],[5,328,80],[7,106,210],[8,180,240],[9,254,210]].map(([z,x,y])=>{
        const v=heat?.[ZONE_MAP[z]]; if(!v) return null;
        return <text key={z} x={x} y={y} textAnchor="middle" fill="#fff" fontSize="16" fontWeight="bold" fontFamily="Arial,sans-serif" style={{pointerEvents:"none"}}>{v}</text>;
      })}
      <g onClick={()=>s(6)} style={{cursor:"pointer"}}>
        <rect x="148" y="125" width="64" height="24" rx="12" fill={sel===6?"#c8a82a":"#fff"}/>
        <text x="180" y="141" textAnchor="middle" fill={sel===6?"#fff":"#0b1a2e"} fontFamily="Arial,sans-serif" fontSize="12" fontWeight="800" style={{pointerEvents:"none"}}>7m</text>
      </g>
    </svg>
  );
}

// ── Result Overlay ────────────────────────────────────────────
function Overlay({ cz, gz, onOk, onCancel, team, homeTeam, awayTeam }) {
  if (cz === null || gz === null) return null;
  const isFuera = gz === "fuera", isPalo = gz === "palo";
  const zoneName = ZONE_NAMES[cz] ?? String(cz);
  const goalName = GOAL_ZONE_NAMES[gz] ?? String(gz);
  const teamName = team==="home" ? (homeTeam?.short_name??homeTeam?.name??"Local") : (awayTeam?.short_name??awayTeam?.name??"Visitante");
  const tColor   = team==="home" ? (homeTeam?.color??"#ef6461") : (awayTeam?.color??"#48cae4");
  const B = ({onClick,bg,children}) => (
    <button onClick={onClick} style={{padding:"14px",borderRadius:10,border:"none",fontSize:16,fontWeight:800,cursor:"pointer",background:bg,color:"#fff",WebkitTapHighlightColor:"transparent",touchAction:"manipulation"}}>
      {children}
    </button>
  );
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.72)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",touchAction:"none"}}>
      <div style={{background:"#132a4e",borderRadius:18,padding:"20px 24px",display:"flex",flexDirection:"column",gap:11,minWidth:230,maxWidth:290,boxShadow:"0 12px 48px rgba(0,0,0,0.7)"}}>
        <div style={{textAlign:"center",fontSize:11,fontWeight:800,padding:"6px 12px",borderRadius:8,background:tColor+"33",color:tColor,border:`1px solid ${tColor}55`}}>
          ⚡ {teamName}
        </div>
        <p style={{textAlign:"center",fontSize:11,color:"#aaa",fontWeight:600,margin:0}}>{zoneName} → {goalName}</p>
        {isFuera ? (
          <B onClick={()=>onOk("miss")} bg="#555">✕ Errado / Fuera</B>
        ) : isPalo ? (
          <B onClick={()=>onOk("post")} bg="#b45309">🔴 Palo / Travesaño</B>
        ) : (
          <>
            <B onClick={()=>onOk("goal")}  bg="#e8453c">⚽ Gol</B>
            <B onClick={()=>onOk("saved")} bg="#2ecfb0">🧤 Atajado</B>
          </>
        )}
        <button onClick={onCancel} style={{padding:"10px",borderRadius:10,border:"none",fontSize:13,fontWeight:600,cursor:"pointer",background:"#1a3a60",color:"#aaa"}}>
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
  homeByQuadrant=[], awayByQuadrant=[],
  activeTeam="home",
  homeTeam, awayTeam,
  onTeamChange,
}) {
  const [cz, setCz] = useState(null); // court zone
  const [gz, setGz] = useState(null); // goal zone

  const heat = activeTeam==="home" ? homeHeatCounts : awayHeatCounts;
  const byQ  = activeTeam==="home" ? homeByQuadrant : awayByQuadrant;

  const confirmReg = useCallback((type) => {
    const zone     = ZONE_MAP[cz] ?? String(cz);
    const quadrant = typeof gz === "number" ? gz : null;
    onRegister?.({ zone, quadrant, goalSection: gz, type });
    setCz(null); setGz(null);
  }, [cz, gz, onRegister]);

  const homeName=homeTeam?.short_name??homeTeam?.name??"Local";
  const awayName=awayTeam?.short_name??awayTeam?.name??"Visitante";
  const homeColor=homeTeam?.color??"#ef6461";
  const awayColor=awayTeam?.color??"#48cae4";

  return (
    <div style={{display:"flex",flexDirection:"column"}}>
      {/* Team selector */}
      {onTeamChange && (
        <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:6}}>
          <span style={{fontSize:9,color:"#666",textTransform:"uppercase",letterSpacing:1.5,whiteSpace:"nowrap"}}>Ataca:</span>
          {[["home",homeName,homeColor],["away",awayName,awayColor]].map(([side,name,color])=>(
            <button key={side} onClick={()=>onTeamChange(side)} style={{flex:1,padding:"7px 8px",borderRadius:8,fontSize:11,fontWeight:800,cursor:"pointer",WebkitTapHighlightColor:"transparent",background:activeTeam===side?color:"rgba(255,255,255,0.06)",color:activeTeam===side?"#fff":"#888",border:`1.5px solid ${activeTeam===side?color:"rgba(255,255,255,0.1)"}`}}>{name}</button>
          ))}
        </div>
      )}
      {/* Module 1: Goal */}
      <div style={{background:"#0a1e3a",borderRadius:"12px 12px 0 0",padding:"6px 10px 4px",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <div style={{fontSize:8,color:"#4a5568",textTransform:"uppercase",letterSpacing:1.5,marginBottom:3}}>Sección del arco</div>
        <GoalSVG sel={gz} onSel={setGz} byQ={byQ}/>
      </div>
      {/* Module 2: Court */}
      <div style={{background:"#0b1a2e",borderRadius:"0 0 12px 12px",padding:"4px 10px 8px",border:"1px solid rgba(255,255,255,0.06)",borderTop:"none"}}>
        <div style={{fontSize:8,color:"#4a5568",textTransform:"uppercase",letterSpacing:1.5,marginBottom:3}}>Zona de tiro</div>
        <div style={{height:190}}>
          <CourtSVG sel={cz} onSel={setCz} heat={heat}/>
        </div>
      </div>
      {/* Overlay */}
      {cz!==null && gz!==null && (
        <Overlay cz={cz} gz={gz} onOk={confirmReg} onCancel={()=>setGz(null)}
          team={activeTeam} homeTeam={homeTeam} awayTeam={awayTeam}/>
      )}
    </div>
  );
}
