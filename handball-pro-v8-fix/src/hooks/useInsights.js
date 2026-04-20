import { useMemo } from "react";
import { T } from "../utils/constants.js";

export function useInsights(stats) {
  return useMemo(() => {
    const insights = [];

    // Baja efectividad de tiro
    if (stats.homeShots >= 5 && stats.homePct < 35) {
      insights.push({
        id: "low_efficiency",
        icon: "⚠️",
        text: `Efectividad baja: ${stats.homePct}% en ${stats.homeShots} tiros`,
        color: T.red,
        bg: "rgba(239,68,68,0.1)",
        border: "rgba(239,68,68,0.3)",
      });
    }

    // Arquero rival dominante
    if (stats.rivalGKTotal >= 4 && stats.rivalGKPct > 40) {
      insights.push({
        id: "rival_gk_dominant",
        icon: "🧤",
        text: `Arquero rival ataja el ${stats.rivalGKPct}% — muy difícil convertir`,
        color: T.orange,
        bg: "rgba(249,115,22,0.1)",
        border: "rgba(249,115,22,0.3)",
      });
    }

    // Demasiadas pérdidas
    if (stats.homeTurnover > 6) {
      insights.push({
        id: "too_many_turnovers",
        icon: "🔄",
        text: `${stats.homeTurnover} pérdidas — controlar la pelota`,
        color: T.yellow,
        bg: "rgba(245,158,11,0.1)",
        border: "rgba(245,158,11,0.3)",
      });
    }

    // Superioridad en goles
    const score = stats;
    if (stats.homeGoals > 0 && stats.awayGoals > 0) {
      const diff = stats.homeGoals - stats.awayGoals;
      if (diff >= 5) {
        insights.push({
          id: "winning_big",
          icon: "🔥",
          text: `Dominando +${diff}. Mantener el ritmo`,
          color: T.green,
          bg: "rgba(34,197,94,0.1)",
          border: "rgba(34,197,94,0.3)",
        });
      } else if (diff <= -5) {
        insights.push({
          id: "losing_big",
          icon: "📉",
          text: `Abajo por ${Math.abs(diff)}. Necesita reacción`,
          color: T.red,
          bg: "rgba(239,68,68,0.1)",
          border: "rgba(239,68,68,0.3)",
        });
      }
    }

    // Muchas exclusiones
    if (stats.homeExcl >= 4) {
      insights.push({
        id: "many_exclusions",
        icon: "⏱",
        text: `${stats.homeExcl} exclusiones propias — riesgo disciplinario`,
        color: T.orange,
        bg: "rgba(249,115,22,0.1)",
        border: "rgba(249,115,22,0.3)",
      });
    }

    return insights.slice(0, 2);
  }, [stats]);
}
