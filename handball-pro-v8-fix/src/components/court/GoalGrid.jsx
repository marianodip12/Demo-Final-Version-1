// clsx not needed

/**
 * GoalGrid – SVG arco de handball 3×3 + zona errado.
 * viewBox: 320 × 148
 * Crossbar at y=8, posts at x=5 and x=315.
 * 3 columnas × 3 filas = 9 cuadrantes bien visibles.
 */

const INNER_ZONES = [
  { id: 'tl', row: 0, col: 0, label: '↖' },
  { id: 'tc', row: 0, col: 1, label: '↑' },
  { id: 'tr', row: 0, col: 2, label: '↗' },
  { id: 'ml', row: 1, col: 0, label: '←' },
  { id: 'mc', row: 1, col: 1, label: '·' },
  { id: 'mr', row: 1, col: 2, label: '→' },
  { id: 'bl', row: 2, col: 0, label: '↙' },
  { id: 'bc', row: 2, col: 1, label: '↓' },
  { id: 'br', row: 2, col: 2, label: '↘' },
]

// 3 columnas iguales dentro de x=5..315 (width=310 → ~103 each)
const COL_X = [6,   109, 212]
const COL_W = [102, 102, 102]
// 3 filas iguales dentro de y=8..148 (height=140 → ~46 each)
const ROW_Y = [9,   55,  101]
const ROW_H = 45

export default function GoalGrid({ selected, onSelect, counts = {} }) {
  const maxCount = Math.max(0, ...Object.values(counts))
  const handleClick = (id) => onSelect?.(selected === id ? null : id)

  return (
    <svg
      viewBox="0 0 320 148"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', display: 'block' }}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* ── Fondo errado (click fuera del arco) ── */}
      <rect
        x="0" y="0" width="320" height="148"
        fill={selected === 'errado' ? 'rgba(100,100,100,0.30)' : 'rgba(0,0,0,0)'}
        style={{ cursor: 'pointer' }}
        onClick={() => handleClick('errado')}
      />
      {/* Texto "ERRADO" en el área exterior */}
      <text x="160" y="6" textAnchor="middle" fill="rgba(255,255,255,0.18)"
        fontSize="5" fontFamily="Arial,sans-serif" fontWeight="bold">
        FUERA
      </text>

      {/* ── Interior del arco ── */}
      <rect x="6" y="8" width="308" height="140" fill="#0d2240" />

      {/* ── 9 cuadrantes ── */}
      {INNER_ZONES.map(({ id, row, col, label }) => {
        const x      = COL_X[col]
        const y      = ROW_Y[row]
        const w      = COL_W[col]
        const h      = ROW_H
        const isSel  = selected === id
        const count  = counts[id] ?? 0
        const heat   = maxCount > 0 ? count / maxCount : 0

        return (
          <g key={id} onClick={() => handleClick(id)} style={{ cursor: 'pointer' }}>
            <rect
              x={x} y={y} width={w} height={h} rx="2"
              fill={
                isSel
                  ? 'rgba(200,168,42,0.70)'
                  : heat > 0
                    ? `rgba(239,100,97,${0.12 + heat * 0.55})`
                    : 'rgba(255,255,255,0.04)'
              }
              stroke={isSel ? '#c8a82a' : 'rgba(255,255,255,0.15)'}
              strokeWidth={isSel ? 2 : 1}
            />
            {/* Dirección visual cuando no hay count */}
            {count === 0 && !isSel && (
              <text
                x={x + w / 2} y={y + h / 2 + 4}
                textAnchor="middle" fill="rgba(255,255,255,0.20)"
                fontSize="14" fontFamily="Arial,sans-serif"
                style={{ pointerEvents: 'none' }}
              >
                {label}
              </text>
            )}
            {/* Count heatmap */}
            {count > 0 && (
              <text
                x={x + w / 2} y={y + h / 2 + 5}
                textAnchor="middle" fill="#fff"
                fontSize="14" fontWeight="bold"
                fontFamily="Arial,sans-serif"
                style={{ pointerEvents: 'none' }}
              >
                {count}
              </text>
            )}
          </g>
        )
      })}

      {/* ── Divisores de grilla (encima de los cuadrantes) ── */}
      {/* Verticales */}
      <line x1="108" y1="8"  x2="108" y2="146" stroke="rgba(255,255,255,0.30)" strokeWidth="1.5" />
      <line x1="211" y1="8"  x2="211" y2="146" stroke="rgba(255,255,255,0.30)" strokeWidth="1.5" />
      {/* Horizontales */}
      <line x1="6"   y1="54" x2="314" y2="54"  stroke="rgba(255,255,255,0.30)" strokeWidth="1.5" />
      <line x1="6"   y1="100" x2="314" y2="100" stroke="rgba(255,255,255,0.30)" strokeWidth="1.5" />

      {/* ── Marco del arco ── */}
      {/* Post izquierdo (franjas) */}
      {Array.from({ length: 18 }, (_, i) => (
        <rect key={`lp${i}`} x="1" y={8 + i * 8} width="6" height="5"
          fill={i % 2 === 0 ? '#ef4444' : '#ffffff'} />
      ))}
      {/* Post derecho (franjas) */}
      {Array.from({ length: 18 }, (_, i) => (
        <rect key={`rp${i}`} x="313" y={8 + i * 8} width="6" height="5"
          fill={i % 2 === 0 ? '#ef4444' : '#ffffff'} />
      ))}
      {/* Travesaño (franjas) */}
      {Array.from({ length: 36 }, (_, i) => (
        <rect key={`cb${i}`} x={i * 9} y="1" width="6" height="7"
          fill={i % 2 === 0 ? '#ef4444' : '#ffffff'} />
      ))}
      {/* Líneas del marco */}
      <line x1="0" y1="8" x2="320" y2="8" stroke="#ef4444" strokeWidth="5" />
      <line x1="5" y1="8" x2="5" y2="148" stroke="#ef4444" strokeWidth="5" />
      <line x1="315" y1="8" x2="315" y2="148" stroke="#ef4444" strokeWidth="5" />

      {/* ── Label "ERRADO" si está seleccionado ── */}
      {selected === 'errado' && (
        <text x="160" y="6" textAnchor="middle" fill="rgba(255,255,255,0.80)"
          fontSize="5.5" fontFamily="Arial,sans-serif" fontWeight="bold">
          ✕ FUERA
        </text>
      )}
    </svg>
  )
}
