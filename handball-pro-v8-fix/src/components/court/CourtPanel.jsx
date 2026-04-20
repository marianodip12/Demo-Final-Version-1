import GoalGrid from './GoalGrid'
import CourtView from './CourtView'

const ZONE_NAMES = {
  extreme_left:  'Ext. Izq.',
  lateral_left:  'Lat. Izq.',
  center_above:  'Centro',
  lateral_right: 'Lat. Der.',
  extreme_right: 'Ext. Der.',
  near_left:     'Cerca Izq.',
  near_center:   'Pivote',
  near_right:    'Cerca Der.',
  '7m':          '7m',
}

const GOAL_NAMES = {
  tl: 'Arr. Izq.', tc: 'Arr. Centro', tr: 'Arr. Der.',
  ml: 'Med. Izq.', mc: 'Med. Centro', mr: 'Med. Der.',
  bl: 'Abj. Izq.', bc: 'Abj. Centro', br: 'Abj. Der.',
  errado: 'Fuera del arco',
}

// ── Team Selector ──────────────────────────────────────────────
function TeamSelector({ homeTeam, awayTeam, selectedTeamSide, onTeamSelect }) {
  const homeName  = homeTeam?.short_name  ?? homeTeam?.name  ?? 'Local'
  const awayName  = awayTeam?.short_name  ?? awayTeam?.name  ?? 'Visitante'
  const homeColor = homeTeam?.color ?? '#ef6461'
  const awayColor = awayTeam?.color ?? '#48cae4'

  return (
    <div
      className="flex-shrink-0 flex items-center gap-2 px-2 py-1"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.2)' }}
    >
      <span className="text-[10px] text-gray-500 uppercase tracking-wider whitespace-nowrap">
        Ataca:
      </span>

      <button
        onClick={() => onTeamSelect?.('home')}
        className="flex-1 py-1 px-2 rounded-lg text-xs font-bold transition-all active:scale-95"
        style={{
          background: selectedTeamSide === 'home' ? homeColor : 'rgba(255,255,255,0.06)',
          color: selectedTeamSide === 'home' ? '#fff' : '#888',
          border: `1.5px solid ${selectedTeamSide === 'home' ? homeColor : 'rgba(255,255,255,0.1)'}`,
        }}
      >
        {homeName}
      </button>

      <span className="text-gray-600 text-[10px]">vs</span>

      <button
        onClick={() => onTeamSelect?.('away')}
        className="flex-1 py-1 px-2 rounded-lg text-xs font-bold transition-all active:scale-95"
        style={{
          background: selectedTeamSide === 'away' ? awayColor : 'rgba(255,255,255,0.06)',
          color: selectedTeamSide === 'away' ? '#fff' : '#888',
          border: `1.5px solid ${selectedTeamSide === 'away' ? awayColor : 'rgba(255,255,255,0.1)'}`,
        }}
      >
        {awayName}
      </button>
    </div>
  )
}

// ── Result Overlay ─────────────────────────────────────────────
function ResultOverlay({
  courtZone, goalSection,
  homeTeam, awayTeam, selectedTeamSide,
  onGol, onSaved, onErrado, onCancel,
}) {
  if (!courtZone || !goalSection) return null

  const isErrado = goalSection === 'errado'
  const zoneName = ZONE_NAMES[courtZone]   ?? courtZone
  const goalName = GOAL_NAMES[goalSection] ?? goalSection

  const teamName  = selectedTeamSide === 'home'
    ? (homeTeam?.short_name ?? homeTeam?.name ?? 'Local')
    : (awayTeam?.short_name ?? awayTeam?.name ?? 'Visitante')
  const teamColor = selectedTeamSide === 'home'
    ? (homeTeam?.color ?? '#ef6461')
    : (awayTeam?.color ?? '#48cae4')

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.65)' }}
    >
      <div
        className="flex flex-col gap-3 rounded-2xl p-5 w-72"
        style={{ background: '#132a4e', boxShadow: '0 8px 40px rgba(0,0,0,0.6)' }}
      >
        <div
          className="text-center text-xs font-bold py-1.5 rounded-lg"
          style={{ background: teamColor + '33', color: teamColor, border: `1px solid ${teamColor}55` }}
        >
          ⚡ {teamName}
        </div>

        <p className="text-center text-xs text-gray-400 font-semibold">
          {zoneName} → {goalName}
        </p>

        {isErrado ? (
          <button
            onClick={onErrado}
            className="py-3 rounded-xl font-bold text-base text-white transition-transform active:scale-95"
            style={{ background: '#555' }}
          >
            ✕ Errado / Fuera
          </button>
        ) : (
          <>
            <button
              onClick={onGol}
              className="py-3 rounded-xl font-bold text-base text-white transition-transform active:scale-95"
              style={{ background: '#e8453c' }}
            >
              ⚽ Gol
            </button>
            <button
              onClick={onSaved}
              className="py-3 rounded-xl font-bold text-base text-white transition-transform active:scale-95"
              style={{ background: '#2ecfb0' }}
            >
              🧤 Atajado
            </button>
          </>
        )}

        <button
          onClick={onCancel}
          className="py-2 rounded-xl text-sm font-semibold text-gray-400 transition-transform active:scale-95"
          style={{ background: '#1a3a60' }}
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}

// ── Main export ─────────────────────────────────────────────────
export default function CourtPanel({
  selectedZone,
  onZoneSelect,
  selectedGoalSection,
  onGoalSectionSelect,
  homeTeam,
  awayTeam,
  selectedTeamSide,
  onTeamSelect,
  isInterrupted,
  heatmap = {},
  onGol,
  onGuardarTiro,
  onErrado,
}) {
  const bothSelected = selectedZone && selectedGoalSection

  return (
    <div className="flex flex-col w-full overflow-hidden" style={{ flex: 1, minHeight: 0 }}>

      {/* ── SELECTOR DE EQUIPO ── */}
      <TeamSelector
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        selectedTeamSide={selectedTeamSide}
        onTeamSelect={onTeamSelect}
      />

      {/* ── ARCO: centrado, altura por aspect-ratio (320:140 ≈ 2.28) ── */}
      <div
        className="flex-shrink-0 flex justify-center items-center px-3 pt-2 pb-2"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div style={{ width: '100%', maxWidth: 560 }}>
          <GoalGrid
            selected={selectedGoalSection}
            onSelect={onGoalSectionSelect}
            counts={heatmap?.goal ?? {}}
          />
        </div>
      </div>

      {/* ── BANNER interrupción ── */}
      {isInterrupted && (
        <div className="flex-shrink-0 h-7 flex items-center justify-center
                        bg-cyan-500/20 border-y border-cyan-500/40">
          <p className="text-cyan-400 text-[11px] font-bold tracking-widest uppercase">
            Interrupción de juego
          </p>
        </div>
      )}

      {/* ── CANCHA: flex:1 → ocupa ~80-85% del espacio restante ── */}
      <div style={{ flex: 1, minHeight: 0 }} className="overflow-hidden">
        <CourtView
          selectedZone={selectedZone}
          onZoneSelect={onZoneSelect}
          heatmap={heatmap?.court ?? {}}
        />
      </div>

      {/* ── OVERLAY resultado ── */}
      {bothSelected && (
        <ResultOverlay
          courtZone={selectedZone}
          goalSection={selectedGoalSection}
          homeTeam={homeTeam}
          awayTeam={awayTeam}
          selectedTeamSide={selectedTeamSide}
          onGol={() => { onGol?.() }}
          onSaved={() => { onGuardarTiro?.() }}
          onErrado={() => { if (onErrado) onErrado(); else onGuardarTiro?.() }}
          onCancel={() => onGoalSectionSelect?.(null)}
        />
      )}
    </div>
  )
}

export { CourtView }
export { CourtView as CourtTopDown }
