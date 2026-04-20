import { T, QUADRANTS } from "../utils/constants.js";

function quadrantColor(pct, hasData) {
  if (!hasData) return { bg: "rgba(0,0,0,.2)", border: T.border, text: T.muted };
  if (pct > 50) return { bg: "rgba(34,197,94,.15)", border: "rgba(34,197,94,.4)", text: T.green };
  if (pct >= 30) return { bg: "rgba(245,158,11,.15)", border: "rgba(245,158,11,.4)", text: T.yellow };
  return { bg: "rgba(239,68,68,.15)", border: "rgba(239,68,68,.4)", text: T.red };
}

export function GoalkeeperGrid({ gk }) {
  if (!gk) return null;
  const pct = gk.total ? Math.round(gk.saved / gk.total * 100) : 0;
  const rows = [[0, 1, 2], [3, 4, 5], [6, 7, 8]];

  return (
    <div style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.border}`, padding: "13px 14px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          background: "#60a5fa22", border: "2px solid #60a5fa44",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: "#60a5fa" }}>#{gk.number || "?"}</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{gk.name}</div>
          <div style={{ fontSize: 11, color: T.muted }}>{gk.total} tiros · {pct}% efectividad</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: pct >= 40 ? T.green : T.red }}>{pct}%</div>
        </div>
      </div>

      {/* Stat pills */}
      <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>
        {[
          { l: "Atajadas", v: gk.saved, c: "#60a5fa" },
          { l: "Goles rec.", v: gk.goals, c: T.red },
          { l: "Errados", v: gk.miss, c: T.muted },
        ].map(x => (
          <div key={x.l} style={{
            flex: 1, textAlign: "center", borderRadius: 8, padding: "6px 0",
            background: x.c + "12", border: `1px solid ${x.c}28`,
          }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: x.c }}>{x.v}</div>
            <div style={{ fontSize: 9, color: T.muted }}>{x.l}</div>
          </div>
        ))}
      </div>

      {/* Goal SVG reference */}
      <div style={{ background: "#0c2340", borderRadius: 10, padding: "8px 6px", marginBottom: 8, border: `1px solid ${T.border}` }}>
        <svg viewBox="0 0 100 40" width="100%" style={{ display: "block" }}>
          <rect x="20" y="2" width="60" height="36" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="1.5" />
          <line x1="40" y1="2" x2="40" y2="38" stroke="rgba(255,255,255,.25)" strokeWidth=".8" />
          <line x1="60" y1="2" x2="60" y2="38" stroke="rgba(255,255,255,.25)" strokeWidth=".8" />
          <line x1="20" y1="15" x2="80" y2="15" stroke="rgba(255,255,255,.25)" strokeWidth=".8" />
          <line x1="20" y1="27" x2="80" y2="27" stroke="rgba(255,255,255,.25)" strokeWidth=".8" />
        </svg>
      </div>

      {/* Quadrant grid */}
      {gk.byQ && (
        <div>
          <div style={{ fontSize: 9, color: T.muted, letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" }}>Por cuadrante</div>
          {rows.map((row, ri) => (
            <div key={ri} style={{ display: "flex", gap: 4, marginBottom: ri < 2 ? 4 : 0 }}>
              {row.map(qi => {
                const q = gk.byQ[qi];
                const qPct = q.total ? Math.round(q.saved / q.total * 100) : 0;
                const cols = quadrantColor(qPct, q.total > 0);
                return (
                  <div key={qi} style={{
                    flex: 1, background: cols.bg, border: `1px solid ${cols.border}`,
                    borderRadius: 7, padding: "6px 2px", textAlign: "center", minHeight: 46,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1,
                  }}>
                    {q.total > 0 ? (
                      <>
                        <div style={{ fontSize: 12, fontWeight: 900, color: cols.text }}>{qPct}%</div>
                        <div style={{ fontSize: 8, color: T.muted }}>{q.saved}/{q.total}</div>
                        <div style={{ fontSize: 9, color: T.muted }}>{QUADRANTS[qi].icon}</div>
                      </>
                    ) : (
                      <span style={{ fontSize: 13, color: T.muted }}>{QUADRANTS[qi].icon}</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function GoalkeeperGridQuick({ data, title }) {
  if (!data || data.total === 0) return null;
  const pct = Math.round(data.saved / data.total * 100);
  return (
    <div style={{ background: T.card, borderRadius: 12, border: `1px solid ${T.border}`, padding: "12px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: T.muted }}>⚡ {title || "Datos rápidos"}</span>
        <span style={{ fontSize: 18, fontWeight: 900, color: pct >= 40 ? T.green : T.red }}>{pct}%</span>
      </div>
      <div style={{ display: "flex", gap: 5 }}>
        {[
          { l: "Atajadas", v: data.saved, c: "#60a5fa" },
          { l: "Goles", v: data.goals, c: T.red },
          { l: "Errados", v: data.miss, c: T.muted },
        ].map(x => (
          <div key={x.l} style={{
            flex: 1, textAlign: "center", borderRadius: 8, padding: "5px 0",
            background: x.c + "12", border: `1px solid ${x.c}28`,
          }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: x.c }}>{x.v}</div>
            <div style={{ fontSize: 9, color: T.muted }}>{x.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
