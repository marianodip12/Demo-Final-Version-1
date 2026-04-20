// ═══════════════════════════════════════════════════
//  THEME
// ═══════════════════════════════════════════════════
export const T = {
  bg:"#060c18", card:"#0d1526", card2:"#111e35",
  accent:"#3b82f6", cyan:"#06b6d4",
  green:"#22c55e", red:"#ef4444", yellow:"#f59e0b",
  orange:"#f97316", purple:"#8b5cf6",
  text:"#e2e8f0", muted:"#64748b", border:"#1a2d4a",
  font:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
};

// ═══════════════════════════════════════════════════
//  ZONES
// ═══════════════════════════════════════════════════
export const ZONES = {
  left_wing:  { label:"Extremo Izq.", short:"EI", emoji:"◀", color:"#06b6d4",
    path:"M 0 0 L 56 0 A 84 84 0 0 1 67 42 L 31 63 A 126 126 0 0 0 14 0 Z", lx:22, ly:34 },
  left_back:  { label:"Back Izq.",    short:"LI", emoji:"↖", color:"#8b5cf6",
    path:"M 67 42 A 84 84 0 0 1 98 73 L 77 109 A 126 126 0 0 0 31 63 Z",    lx:53, ly:74 },
  center:     { label:"Central",      short:"CE", emoji:"↑", color:"#f59e0b",
    path:"M 98 73 A 84 84 0 0 1 182 73 L 203 109 A 126 126 0 0 0 77 109 Z", lx:140,ly:90 },
  right_back: { label:"Back Der.",    short:"LD", emoji:"↗", color:"#8b5cf6",
    path:"M 213 42 A 84 84 0 0 0 182 73 L 203 109 A 126 126 0 0 1 249 63 Z",lx:220,ly:74 },
  right_wing: { label:"Extremo Der.", short:"ED", emoji:"▶", color:"#06b6d4",
    path:"M 280 0 L 224 0 A 84 84 0 0 0 213 42 L 249 63 A 126 126 0 0 1 266 0 Z",lx:256,ly:34},
  pivot:      { label:"Pivote",       short:"PI", emoji:"⬟", color:"#ef4444",
    path:"M 98 73 A 84 84 0 0 1 182 73 L 140 0 Z",                          lx:140,ly:50 },
  penal:      { label:"Penal 7m",     short:"7m", emoji:"⚪", color:"#ffffff",
    path:"M 116 -28 L 164 -28 L 164 0 L 116 0 Z",                           lx:140,ly:-16 },
};

// ═══════════════════════════════════════════════════
//  QUADRANTS
// ═══════════════════════════════════════════════════
export const QUADRANTS = [
  {id:0,label:"Sup Izq",icon:"↖",row:0,col:0},{id:1,label:"Sup Cen",icon:"↑",row:0,col:1},
  {id:2,label:"Sup Der",icon:"↗",row:0,col:2},{id:3,label:"Med Izq",icon:"←",row:1,col:0},
  {id:4,label:"Centro", icon:"●",row:1,col:1},{id:5,label:"Med Der",icon:"→",row:1,col:2},
  {id:6,label:"Inf Izq",icon:"↙",row:2,col:0},{id:7,label:"Inf Cen",icon:"↓",row:2,col:1},
  {id:8,label:"Inf Der",icon:"↘",row:2,col:2},
];

// ═══════════════════════════════════════════════════
//  EVENT TYPES
// ═══════════════════════════════════════════════════
export const EV_TYPES = {
  goal:        {label:"Gol",          icon:"⚽",color:"#22c55e"},
  miss:        {label:"Tiro errado",  icon:"❌",color:"#64748b"},
  saved:       {label:"Atajada",      icon:"🧤",color:"#60a5fa"},
  turnover:    {label:"Pérdida",      icon:"🔄",color:"#94a3b8"},
  timeout:     {label:"T. Muerto",    icon:"⏸",color:"#f59e0b"},
  exclusion:   {label:"Exclusión 2'", icon:"⏱",color:"#f97316"},
  red_card:    {label:"Tarjeta Roja", icon:"🟥",color:"#ef4444"},
  blue_card:   {label:"Tarjeta Azul", icon:"🟦",color:"#3b82f6"},
  yellow_card: {label:"Amarilla",     icon:"🟨",color:"#f59e0b"},
  half_time:   {label:"Descanso",     icon:"🔔",color:"#8b5cf6"},
};

// ═══════════════════════════════════════════════════
//  MISC CONSTANTS
// ═══════════════════════════════════════════════════
export const COMPETITIONS = ["Liga","Copa","Super 8","Amistoso","Torneo Regional"];
export const VENUES = ["Local","Visitante","Neutro"];
export const POSITIONS = ["Arquero","Armador","Lateral Izq.","Lateral Der.","Extremo Izq.","Extremo Der.","Pivote"];

export const DISTANCES = [
  {k:"6m",l:"6m",emoji:"🟢"},{k:"9m",l:"9m",emoji:"🟡"},
  {k:"12m",l:"12m",emoji:"🟠"},{k:"penal",l:"Penal 7m",emoji:"⚪"},{k:"arco",l:"Arco-Arco",emoji:"🔴"},
];
export const SITUATIONS = [
  {k:"igualdad",l:"Igualdad",emoji:"⚖️",color:"#64748b"},
  {k:"superioridad",l:"Superioridad",emoji:"📈",color:"#22c55e"},
  {k:"inferioridad",l:"Inferioridad",emoji:"📉",color:"#ef4444"},
];
export const THROW_TYPES = [
  {k:"salto",l:"Salto",emoji:"🦘"},{k:"habilidad",l:"Habilidad",emoji:"🤸"},
  {k:"finta",l:"Finta",emoji:"🌀"},{k:"penetracion",l:"Penetración",emoji:"🏃"},
  {k:"otro",l:"Otro",emoji:"❓"},
];

export const TEAM_COLORS = ["#ef4444","#3b82f6","#22c55e","#f59e0b","#8b5cf6","#06b6d4","#f97316","#ec4899"];

// ═══════════════════════════════════════════════════
//  NAV
// ═══════════════════════════════════════════════════
export const NAV = [
  {k:"matches", icon:"🗓", label:"Partidos"},
  {k:"teams",   icon:"👥", label:"Equipos"},
  {k:"live",    icon:"➕", label:"En Vivo"},
  {k:"stats",   icon:"📊", label:"Stats"},
  {k:"evolution",icon:"📈",label:"Evolución"},
];
