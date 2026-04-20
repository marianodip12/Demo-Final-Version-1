export function InsightBanner({ insights }) {
  if (!insights || insights.length === 0) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
      {insights.map(ins => (
        <div key={ins.id} style={{
          background: ins.bg,
          border: `1px solid ${ins.border}`,
          borderRadius: 10,
          padding: "9px 12px",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>{ins.icon}</span>
          <span style={{ fontSize: 12, color: ins.color, fontWeight: 600, lineHeight: 1.3 }}>{ins.text}</span>
        </div>
      ))}
    </div>
  );
}
