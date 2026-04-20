import { T } from "../utils/constants.js";

export function MetricCard({ emoji, label, value, color, subLabel, style = {} }) {
  return (
    <div style={{
      background: T.card, borderRadius: 12, padding: "10px 6px",
      border: `1px solid ${T.border}`, textAlign: "center",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
      ...style,
    }}>
      {emoji && <span style={{ fontSize: 16, lineHeight: 1 }}>{emoji}</span>}
      <div style={{ fontSize: 20, fontWeight: 900, color: color || T.text, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 8, color: T.muted, letterSpacing: 0.5, textTransform: "uppercase", fontWeight: 600 }}>{label}</div>
      {subLabel && <div style={{ fontSize: 9, color: T.muted }}>{subLabel}</div>}
    </div>
  );
}
