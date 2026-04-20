import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { supabase } from "../lib/supabase.js";
import { T, EV_TYPES, ZONES, QUADRANTS, DISTANCES, SITUATIONS, THROW_TYPES, POSITIONS } from "../utils/constants.js";
import { calcNextScore, fmtTime } from "../utils/calculations.js";
import { useMatchStats } from "../hooks/useMatchStats.js";
import { useInsights } from "../hooks/useInsights.js";
import { ScoreBar } from "../components/ScoreBar.jsx";
import { InsightBanner } from "../components/InsightBanner.jsx";
import { MetricCard } from "../components/MetricCard.jsx";
import { EventButtons } from "../components/EventButtons.jsx";
import { EventCard, Modal, SectionLabel, Btn, MiniCourt, QuadrantPicker, PlayerPicker, Badge } from "../components/shared.jsx";
import CourtModule from "../components/court/CourtModule.jsx";

export function LiveMatch({
  events, setEvents,
  matchInfo, homeTeam, awayPlayers,
  persistEvent, updatePersistedEvent,
  onCloseMatch, onStartMatch,
  matchStatus,
}) {
  // Timer state — restaurado desde localStorage al refrescar
  const [half, setHalf]             = useState(() => {
    try { return parseInt(localStorage.getItem("hb_timer_half") || "1"); } catch { return 1; }
  });
  const [timerSecs, setTimerSecs]   = useState(() => {
    try { return parseInt(localStorage.getItem("hb_timer_secs") || String(30 * 60)); } catch { return 30 * 60; }
  });
  const [timerRunning, setTimerRunning] = useState(false); // siempre pausado al recargar — seguro
  const [exclusions, setExclusions] = useState([]);
  const [showModal, setShowModal]   = useState(null); // "quick_more" | "shot_detail" | "disc"
  const [activeTeam, setActiveTeam] = useState("home"); // equipo activo para registro rápido
  const [completingId, setCompletingId] = useState(null);
  const [form, setForm]             = useState({ type: "goal", team: "home", zone: null, quadrant: null, shooter: null, goalkeeper: null, sanctioned: null, minute: "1" });
  const [quickZone, setQuickZone]   = useState(null);
  const timerRef = useRef(null);

  const awayTeam = { name: matchInfo.away || "Rival", color: "#64748b", players: awayPlayers };
  const homeC = homeTeam?.color || T.accent;
  const awayC = "#64748b";

  const { score, stats, heatCounts, homeHeatCounts, awayHeatCounts, byQuadrant, homeByQuadrant, awayByQuadrant, pendingEvents } = useMatchStats(events);
  const insights = useInsights(stats);

  // ─── TIMER ──────────────────────────────────────────────
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSecs(s => {
          const ns = s - 1;
          if (ns <= 0) { clearInterval(timerRef.current); setTimerRunning(false); return 0; }
          // Persist every tick
          try { localStorage.setItem("hb_timer_secs", String(ns)); } catch {}
          return ns;
        });
        setExclusions(prev => prev.map(e => ({ ...e, secs: e.secs - 1 })).filter(e => e.secs > 0));
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerRunning]);

  // Persist half and secs when they change (not running, e.g. startHalf)
  useEffect(() => {
    try {
      localStorage.setItem("hb_timer_half", String(half));
      localStorage.setItem("hb_timer_secs", String(timerSecs));
    } catch {}
  }, [half, timerSecs]);

  const realMinute = useMemo(() =>
    Math.max(1, Math.ceil((30 * 60 - timerSecs) / 60) + (half === 2 ? 30 : 0)),
  [timerSecs, half]);

  const startHalf = (h) => {
    setHalf(h);
    setTimerSecs(30 * 60);
    setTimerRunning(true);
    setExclusions([]);
    try {
      localStorage.setItem("hb_timer_half", String(h));
      localStorage.setItem("hb_timer_secs", String(30 * 60));
    } catch {}
  };

  const addExclusion = (team) => {
    setExclusions(prev => {
      if (prev.filter(e => e.team === team).length >= 2) return prev;
      return [...prev, { id: Date.now(), team, player: null, secs: 120 }];
    });
  };

  // ─── SAVE EVENT ─────────────────────────────────────────
  const saveEv = useCallback(async (ev) => {
    if (persistEvent) {
      const uuid = await persistEvent(ev).catch(() => null);
      if (uuid && uuid !== ev.id) setEvents(prev => prev.map(e => e.id === ev.id ? { ...e, id: uuid } : e));
    }
  }, [persistEvent, setEvents]);

  // ─── QUICK TAP ──────────────────────────────────────────
  const quickTap = useCallback((type, team) => {
    const sc = calcNextScore(events, type, team);
    const min = timerRunning || timerSecs < 30 * 60 ? realMinute : 1;
    const ev = {
      id: Date.now(), min, team, type,
      zone: quickZone, quadrant: null, situation: "igualdad",
      shooter: null, goalkeeper: null, sanctioned: null,
      completed: false, quickMode: true, ...sc,
    };
    setEvents(prev => [...prev, ev]);
    saveEv(ev);
    if (type === "exclusion") addExclusion(team);
  }, [events, timerRunning, timerSecs, realMinute, quickZone, setEvents, saveEv]);

  const deleteEvent = useCallback((id) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    supabase.from("events").delete().eq("id", id).catch(() => {});
  }, [setEvents]);

  // ─── FORM HELPERS ───────────────────────────────────────
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const getPlayerList = (team, role) => {
    const src = team === "home" ? homeTeam?.players || [] : awayTeam.players || [];
    if (role === "field") return src.filter(p => p.position !== "Arquero" && p.pos !== "Arquero");
    return src;
  };

  // ─── SUBMIT SHOT ────────────────────────────────────────
  const submitShot = () => {
    const min = parseInt(form.minute) || realMinute;
    const sc = calcNextScore(events, form.type, form.team);
    const fp = getPlayerList(form.team, "field");
    const op = getPlayerList(form.team === "home" ? "away" : "home", "all");
    const shooter    = form.shooter ? { name: form.shooter, number: fp.find(p => p.name === form.shooter)?.number || 0 } : null;
    const goalkeeper = form.goalkeeper ? { name: form.goalkeeper, number: op.find(p => p.name === form.goalkeeper)?.number || 0 } : null;

    if (completingId) {
      const upd2 = { zone: form.zone, quadrant: form.quadrant, min, type: form.type, shooter, goalkeeper, completed: true };
      setEvents(prev => prev.map(e => e.id === completingId ? { ...e, ...upd2 } : e));
      if (updatePersistedEvent) updatePersistedEvent(completingId, upd2).catch(() => {});
      setCompletingId(null);
    } else {
      const ev = { id: Date.now(), min, team: form.team, type: form.type, zone: form.zone, quadrant: form.quadrant, shooter, goalkeeper, sanctioned: null, completed: true, ...sc };
      setEvents(prev => [...prev, ev]);
      saveEv(ev);
    }
    setShowModal(null);
    setForm({ type: "goal", team: "home", zone: null, quadrant: null, shooter: null, goalkeeper: null, sanctioned: null, minute: "1" });
  };

  // ─── SUBMIT DISC ────────────────────────────────────────
  const submitDisc = () => {
    const min = parseInt(form.minute) || realMinute;
    const prev = events.filter(e => e.hScore != null).slice(-1)[0] || { hScore: 0, aScore: 0 };
    const src = getPlayerList(form.team, "all");
    const sanctioned = form.sanctioned ? { name: form.sanctioned, number: src.find(p => p.name === form.sanctioned)?.number || 0 } : null;
    const ev = { id: Date.now(), min, team: form.team, type: form.type, completed: true, sanctioned, hScore: prev.hScore, aScore: prev.aScore };
    setEvents(prev => [...prev, ev]);
    saveEv(ev);
    setShowModal(null);
    setForm(f => ({ ...f, sanctioned: null }));
  };

  const openComplete = (ev) => {
    setCompletingId(ev.id);
    setForm({ type: ev.type, team: ev.team, zone: null, quadrant: null, shooter: null, goalkeeper: null, sanctioned: null, minute: String(ev.min) });
    setShowModal("shot_detail");
  };

  // ─── METRIC GRID — 4 de mi equipo + 4 del rival ────────
  const activeStats = activeTeam === "home" ? {
    goals:    stats.homeGoals,
    shots:    stats.homeShots,
    pct:      stats.homePct,
    turnover: stats.homeTurnover,
    gkSaved:  stats.rivalGKSaved,   // atajadas del arq rival = tiros al arco
    gkPct:    stats.rivalGKPct,
    penals:   stats.homePenals,
    goalsAgainst: stats.awayGoals,
  } : {
    goals:    stats.awayGoals,
    shots:    stats.awayShots,
    pct:      stats.awayPct,
    turnover: stats.awayTurnover,
    gkSaved:  stats.homeGKSaved,    // atajadas del arq del local
    gkPct:    stats.homeGKPct,
    penals:   stats.awayPenals,
    goalsAgainst: stats.homeGoals,
  };
  const rivalLabel = activeTeam === "home"
    ? `Arq. ${matchInfo.away}`
    : `Arq. ${homeTeam?.name || "Local"}`;

  const metrics = [
    { emoji: "⚽", label: "Goles",         value: activeStats.goals,       color: T.green },
    { emoji: "🎯", label: "Tiros",          value: activeStats.shots,       color: T.text },
    { emoji: "📊", label: "Efectividad",    value: `${activeStats.pct}%`,   color: activeStats.pct >= 50 ? T.green : activeStats.pct >= 35 ? T.yellow : T.red },
    { emoji: "🔄", label: "Pérdidas",       value: activeStats.turnover,    color: activeStats.turnover > 6 ? T.red : T.text },
    { emoji: "🧤", label: "Ataj. rival",    value: activeStats.gkSaved,     color: "#60a5fa" },
    { emoji: "🛡",  label: `% ${rivalLabel}`,value: `${activeStats.gkPct}%`,color: activeStats.gkPct > 40 ? T.orange : T.green },
    { emoji: "🥅", label: "Penales",        value: activeStats.penals,      color: T.purple },
    { emoji: "🚨", label: "Goles recibidos",value: activeStats.goalsAgainst,color: activeStats.goalsAgainst > activeStats.goals ? T.red : T.muted },
  ];

  // ─── NO ACTIVE MATCH ────────────────────────────────────
  if (matchStatus !== "live") {
    return (
      <div style={{ textAlign: "center", padding: "50px 20px" }}>
        <div style={{ fontSize: 52, marginBottom: 14 }}>🤾</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: T.text, marginBottom: 8 }}>Sin partido en curso</div>
        <div style={{ fontSize: 13, color: T.muted, marginBottom: 24 }}>Iniciá un nuevo partido desde la pestaña Partidos</div>
        <Btn onClick={onStartMatch} color={T.accent}>+ Nuevo partido</Btn>
      </div>
    );
  }

  return (
    <div>
      <style>{`@keyframes livePulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>

      {/* Live badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: T.red, animation: "livePulse 1.2s infinite" }} />
        <span style={{ fontSize: 10, color: T.red, fontWeight: 800, letterSpacing: 2 }}>EN VIVO</span>
        <span style={{ fontSize: 10, color: T.muted }}>— {matchInfo.home} vs {matchInfo.away}</span>
        <div style={{ flex: 1 }} />
        <button onClick={onCloseMatch}
          style={{ background: "rgba(239,68,68,.15)", border: "1px solid rgba(239,68,68,.4)", color: "#fca5a5", borderRadius: 9, padding: "6px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
          🏁 Cerrar
        </button>
      </div>

      {/* Score bar */}
      <ScoreBar
        homeTeam={homeTeam} awayName={matchInfo.away} score={score}
        timerSecs={timerSecs} timerRunning={timerRunning} half={half}
        onToggleTimer={() => setTimerRunning(r => !r)}
        onStartHalf={startHalf}
        exclusions={exclusions}
        onRemoveExclusion={id => setExclusions(prev => prev.filter(e => e.id !== id))}
      />

      {/* 8-metric grid */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 9, color: T.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>{activeTeam === "home" ? (homeTeam?.name || "Local").toUpperCase() : (matchInfo.away || "Rival").toUpperCase()} / RIVAL</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 5 }}>
          {metrics.map((m, i) => (
            <MetricCard key={i} {...m} />
          ))}
        </div>
      </div>

      {/* Insights */}
      <InsightBanner insights={insights} />


      {/* Court module — registra tiros directamente */}
      <CourtModule
        homeHeatCounts={homeHeatCounts}
        awayHeatCounts={awayHeatCounts}
        homeByQuadrant={homeByQuadrant}
        awayByQuadrant={awayByQuadrant}
        activeTeam={activeTeam}
        homeTeam={homeTeam}
        awayTeam={{ name: matchInfo.away, color: awayC }}
        onTeamChange={setActiveTeam}
        onRegister={({ zone, quadrant, goalSection, type }) => {
          const sc = calcNextScore(events, type, activeTeam);
          const min = timerRunning || timerSecs < 30 * 60 ? realMinute : 1;
          const ev = {
            id: Date.now(), min, team: activeTeam, type,
            zone, quadrant, goalSection,
            situation: "igualdad",
            shooter: null, goalkeeper: null, sanctioned: null,
            completed: true, ...sc,
          };
          setEvents(prev => [...prev, ev]);
          saveEv(ev);
        }}
      />

      {/* Event buttons */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 9, color: T.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>REGISTRAR EVENTO</div>
        <EventButtons
          onQuickTap={quickTap}
          homeTeamName={homeTeam?.name || "Local"}
          awayTeamName={matchInfo.away}
          homeColor={homeC}
          awayColor={awayC}
          onMoreEvent={() => { upd("type", "exclusion"); upd("team", activeTeam); setShowModal("quick_more"); }}
          activeTeam={activeTeam}
          onToggleTeam={setActiveTeam}
        />
      </div>

      {/* Pending completions */}
      {pendingEvents.length > 0 && (
        <div style={{ background: "rgba(245,158,11,.08)", border: "1px solid rgba(245,158,11,.3)", borderRadius: 12, padding: "10px 12px", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: T.yellow, fontWeight: 700 }}>⚡ {pendingEvents.length} eventos para completar</span>
          </div>
          {pendingEvents.slice(0, 3).map(ev => (
            <div key={ev.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 13 }}>{EV_TYPES[ev.type]?.icon}</span>
                <span style={{ fontSize: 11, color: T.text }}>{EV_TYPES[ev.type]?.label} · min {ev.min}</span>
              </div>
              <button onClick={() => openComplete(ev)}
                style={{ background: T.yellow + "22", border: `1px solid ${T.yellow}44`, color: T.yellow, borderRadius: 8, padding: "5px 10px", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>
                Completar →
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Recent events */}
      {events.length > 0 && (
        <div>
          <div style={{ fontSize: 9, color: T.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>ÚLTIMOS EVENTOS</div>
          {[...events].reverse().slice(0, 5).map(ev => (
            <EventCard key={ev.id} ev={ev}
              homeColor={homeC} awayColor={awayC}
              homeName={homeTeam?.name || "Local"} awayName={matchInfo.away}
              onDelete={deleteEvent}
            />
          ))}
        </div>
      )}

      {/* ── MORE EVENTS MODAL ── */}
      {showModal === "quick_more" && (
        <Modal title="➕ Más eventos" onClose={() => setShowModal(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", gap: 6 }}>
              {[
                { k: "home", name: homeTeam?.name || "Local", color: homeC },
                { k: "away", name: matchInfo.away || "Rival", color: awayC },
              ].map(t => (
                <button key={t.k} onClick={() => upd("team", t.k)}
                  style={{ flex: 1, background: form.team === t.k ? t.color + "22" : T.card2 + "bb", color: form.team === t.k ? t.color : T.muted, border: `1.5px solid ${form.team === t.k ? t.color : T.border}`, borderRadius: 10, padding: "10px", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                  {t.name}
                </button>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {[
                { k: "exclusion", l: "⏱ Exclusión 2'", c: T.orange },
                { k: "timeout", l: "⏸ Tiempo Muerto", c: T.yellow },
                { k: "red_card", l: "🟥 Tarjeta Roja", c: T.red },
                { k: "yellow_card", l: "🟨 Tarjeta Amarilla", c: T.yellow },
                { k: "blue_card", l: "🟦 Tarjeta Azul", c: T.accent },
                { k: "half_time", l: "🔔 Descanso", c: T.purple },
              ].map(s => (
                <button key={s.k} onClick={() => upd("type", s.k)}
                  style={{ background: form.type === s.k ? s.c + "22" : T.card2, color: form.type === s.k ? s.c : T.muted, border: `1.5px solid ${form.type === s.k ? s.c : T.border}`, borderRadius: 11, padding: "10px", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>
                  {s.l}
                </button>
              ))}
            </div>
            {form.type !== "timeout" && form.type !== "half_time" && (
              <PlayerPicker
                players={form.team === "home" ? homeTeam?.players || [] : awayTeam.players}
                value={form.sanctioned}
                onChange={v => upd("sanctioned", v)}
                label="JUGADOR SANCIONADO"
                accent={EV_TYPES[form.type]?.color}
              />
            )}
            <Btn onClick={submitDisc} color={EV_TYPES[form.type]?.color || T.accent}>
              ✓ Confirmar {EV_TYPES[form.type]?.label}
            </Btn>
          </div>
        </Modal>
      )}

      {/* ── SHOT DETAIL MODAL ── */}
      {showModal === "shot_detail" && (
        <Modal title={completingId ? "📋 Completar tiro" : "🎯 Detalles del tiro"} onClose={() => { setShowModal(null); setCompletingId(null); }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 6 }}>
              {[{ k: "goal", l: "⚽ GOL", c: T.green }, { k: "saved", l: "🧤 ATAJADO", c: "#60a5fa" }, { k: "miss", l: "❌ ERRADO", c: T.red }].map(r => (
                <button key={r.k} onClick={() => upd("type", r.k)}
                  style={{ flex: 1, background: form.type === r.k ? r.c + "22" : T.card2, color: form.type === r.k ? r.c : T.muted, border: `1.5px solid ${form.type === r.k ? r.c : T.border}`, borderRadius: 10, padding: "10px 4px", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>
                  {r.l}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {[{ k: "home", name: homeTeam?.name || "Local", color: homeC }, { k: "away", name: matchInfo.away || "Rival", color: awayC }].map(t => (
                <button key={t.k} onClick={() => upd("team", t.k)}
                  style={{ flex: 1, background: form.team === t.k ? t.color + "22" : T.card2, color: form.team === t.k ? t.color : T.muted, border: `1.5px solid ${form.team === t.k ? t.color : T.border}`, borderRadius: 10, padding: "10px", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                  {t.name}
                </button>
              ))}
            </div>
            <div>
              <SectionLabel>MINUTO</SectionLabel>
              <input type="number" value={form.minute} onChange={e => upd("minute", e.target.value)} min="1" max="60"
                style={{ background: T.card2, border: `1px solid ${T.border}`, borderRadius: 10, padding: "11px 14px", color: T.text, fontSize: 15, fontWeight: 800, width: "100%", boxSizing: "border-box" }} />
            </div>
            <CourtModule
              homeHeatCounts={homeHeatCounts}
              awayHeatCounts={awayHeatCounts}
              homeByQuadrant={homeByQuadrant}
              awayByQuadrant={awayByQuadrant}
              activeTeam={form.team}
              homeTeam={homeTeam}
              awayTeam={{ name: matchInfo.away, color: awayC }}
              onRegister={({ zone, quadrant, goalSection, type }) => { upd("zone", zone); upd("quadrant", quadrant); upd("type", type); }}
            />
            <QuadrantPicker value={form.quadrant} onChange={q => upd("quadrant", q)} resultColor={form.type === "goal" ? T.green : form.type === "saved" ? "#60a5fa" : T.red} />
            <PlayerPicker
              players={getPlayerList(form.team, "field")}
              value={form.shooter}
              onChange={v => upd("shooter", v)}
              label="JUGADOR"
              accent={form.team === "home" ? homeC : awayC}
            />
            <PlayerPicker
              players={form.team === "home" ? awayTeam.players : homeTeam?.players || []}
              value={form.goalkeeper}
              onChange={v => upd("goalkeeper", v)}
              label="ARQUERO RIVAL"
              accent="#60a5fa"
            />
            <Btn onClick={submitShot} disabled={!form.zone || form.quadrant == null} color={T.accent}>✓ Confirmar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
