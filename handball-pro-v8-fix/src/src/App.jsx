import { useState, useMemo, useCallback } from "react";
import { supabase } from "./lib/supabase.js";
import { T, COMPETITIONS, NAV } from "./utils/constants.js";
import { computeScore } from "./utils/calculations.js";
import { useSupabaseData } from "./hooks/useSupabaseData.js";

// Pages
import { LiveMatchV2 } from "./pages/LiveMatchV2.jsx";
import { MatchAnalysis } from "./pages/MatchAnalysis.jsx";
import { Matches } from "./pages/Matches.jsx";
import { Team } from "./pages/Team.jsx";
import { Evolution } from "./pages/Evolution.jsx";

// Shared components
import { Modal, SectionLabel, Btn } from "./components/shared.jsx";

// ─── NEW MATCH MODAL ─────────────────────────────────────
function NewMatchModal({ teams, onStart, onClose }) {
  const [form, setForm]               = useState({ teamId: teams[0]?.id || "", awayName: "", competition: "Liga", round: "" });
  const [rivalPlayers, setRivalPlayers] = useState([]);
  const [addingPlayer, setAddingPlayer] = useState(false);
  const [newP, setNewP]               = useState({ name: "", number: "", position: "Campo" });
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const onAwayNameChange = async (val) => {
    upd("awayName", val);
    if (val.length >= 3) {
      try {
        const { data } = await supabase.from("rival_teams")
          .select("*, rival_players(*)")
          .ilike("name", `%${val}%`)
          .maybeSingle();
        if (data?.rival_players?.length) setRivalPlayers(data.rival_players);
      } catch (e) {}
    }
  };

  const addRivalPlayer = () => {
    if (!newP.name || !newP.number) return;
    setRivalPlayers(prev => [...prev, { id: Date.now(), name: newP.name.trim(), number: parseInt(newP.number), position: newP.position }]);
    setNewP({ name: "", number: "", position: "Campo" });
    setAddingPlayer(false);
  };

  return (
    <Modal title="🤾 Nuevo Partido" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <SectionLabel>MI EQUIPO</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {teams.map(t => (
              <button key={t.id} onClick={() => upd("teamId", t.id)}
                style={{ background: form.teamId === t.id ? t.color + "22" : T.card2, color: form.teamId === t.id ? t.color : T.muted, border: `1.5px solid ${form.teamId === t.id ? t.color : T.border}`, borderRadius: 10, padding: "9px 13px", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: t.color }} />
                {t.name}
              </button>
            ))}
            {teams.length === 0 && <span style={{ fontSize: 12, color: T.muted }}>Creá un equipo primero en la pestaña 👥</span>}
          </div>
        </div>
        <div>
          <SectionLabel>RIVAL</SectionLabel>
          <input value={form.awayName} onChange={e => onAwayNameChange(e.target.value)}
            placeholder="Nombre del equipo rival"
            style={{ width: "100%", background: T.card2, border: `1px solid ${T.border}`, borderRadius: 10, padding: "11px 14px", color: T.text, fontSize: 14, boxSizing: "border-box" }} />
        </div>
        {form.awayName.trim().length > 0 && (
          <div style={{ background: T.card2, borderRadius: 11, border: `1px solid ${T.border}`, padding: "10px 12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: rivalPlayers.length > 0 ? 8 : 0 }}>
              <SectionLabel>PLANTEL RIVAL (opcional)</SectionLabel>
              <button onClick={() => setAddingPlayer(!addingPlayer)}
                style={{ background: T.accent + "22", border: `1px solid ${T.accent}44`, color: T.accent, borderRadius: 8, padding: "4px 10px", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>
                + Agregar
              </button>
            </div>
            {rivalPlayers.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
                {rivalPlayers.map((p, i) => (
                  <div key={p.id || i} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: "4px 8px", fontSize: 10, color: T.text, display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ color: T.muted, fontWeight: 700 }}>#{p.number}</span> {p.name}
                    <button onClick={() => setRivalPlayers(prev => prev.filter((_, j) => j !== i))}
                      style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 11, padding: 0 }}>✕</button>
                  </div>
                ))}
              </div>
            )}
            {addingPlayer && (
              <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                <input value={newP.number} onChange={e => setNewP(f => ({ ...f, number: e.target.value }))}
                  placeholder="#" type="number"
                  style={{ width: 50, background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: "7px 8px", color: T.text, fontSize: 12, boxSizing: "border-box" }} />
                <input value={newP.name} onChange={e => setNewP(f => ({ ...f, name: e.target.value }))}
                  placeholder="Nombre"
                  style={{ flex: 1, background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: "7px 10px", color: T.text, fontSize: 12, boxSizing: "border-box" }} />
                <button onClick={addRivalPlayer}
                  style={{ background: T.green, border: "none", color: "#fff", borderRadius: 8, padding: "7px 12px", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>✓</button>
              </div>
            )}
          </div>
        )}
        <div>
          <SectionLabel>COMPETENCIA</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {COMPETITIONS.map(c => (
              <button key={c} onClick={() => upd("competition", c)}
                style={{ background: form.competition === c ? T.accent + "22" : T.card2, color: form.competition === c ? T.accent : T.muted, border: `1px solid ${form.competition === c ? T.accent : T.border}`, borderRadius: 9, padding: "7px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                {c}
              </button>
            ))}
          </div>
        </div>
        <div>
          <SectionLabel>JORNADA / FECHA (opcional)</SectionLabel>
          <input value={form.round} onChange={e => upd("round", e.target.value)}
            placeholder="Ej: Jornada 5, Final, etc."
            style={{ width: "100%", background: T.card2, border: `1px solid ${T.border}`, borderRadius: 10, padding: "11px 14px", color: T.text, fontSize: 13, boxSizing: "border-box" }} />
        </div>
        <Btn onClick={() => onStart({ ...form, rivalPlayers })} disabled={!form.teamId || !form.awayName.trim()} color={T.accent}>
          ▶ Iniciar partido
        </Btn>
      </div>
    </Modal>
  );
}

function CloseConfirmModal({ liveMatchInfo, liveScore, onConfirm, onCancel }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.85)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: 20 }}>
      <div style={{ background: T.card, borderRadius: 20, padding: 22, border: `1px solid ${T.border}`, maxWidth: 360, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 34, marginBottom: 10 }}>🏁</div>
        <div style={{ fontSize: 16, fontWeight: 800, color: T.text, marginBottom: 5 }}>¿Cerrar el partido?</div>
        <div style={{ fontSize: 13, color: T.muted, marginBottom: 14 }}>
          {liveMatchInfo.home} {liveScore.h} – {liveScore.a} {liveMatchInfo.away}
        </div>
        <div style={{ background: "rgba(245,158,11,.08)", border: "1px solid rgba(245,158,11,.3)", borderRadius: 10, padding: "9px 12px", marginBottom: 14, textAlign: "left" }}>
          <div style={{ fontSize: 11, color: T.yellow }}>💡 Los datos quedan guardados en Supabase para análisis posterior.</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={onCancel} outline color={T.muted} style={{ flex: 1 }}>Cancelar</Btn>
          <Btn onClick={onConfirm} color={T.green} style={{ flex: 2 }}>✓ Cerrar partido</Btn>
        </div>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: 14 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 36, height: 36, borderRadius: "50%", border: `3px solid ${T.border}`, borderTop: `3px solid ${T.accent}`, animation: "spin 1s linear infinite" }} />
      <span style={{ fontSize: 13, color: T.muted }}>Cargando...</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  APP
// ═══════════════════════════════════════════════════
export default function App() {
  const [tab, setTab]                       = useState("matches");
  const [showNewMatch, setShowNewMatch]     = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [analysisMatch, setAnalysisMatch]   = useState(null);
  const [evoMatch, setEvoMatch]             = useState(null);

  const {
    teams, setTeams, homeTeam, onTeamUpdated,
    liveEvents, setLiveEvents, matchStatus,
    liveMatchInfo, awayPlayers,
    completedMatches, dbLoading,
    startMatch, persistEvent, updatePersistedEvent,
    closeMatch, deleteMatch, reopenMatch,
  } = useSupabaseData();

  const liveScore = useMemo(() => computeScore(liveEvents), [liveEvents]);

  const handleStartMatch = useCallback(async (opts) => {
    await startMatch(opts);
    setShowNewMatch(false);
    setTab("live");
  }, [startMatch]);

  const handleCloseMatch = useCallback(async () => {
    await closeMatch(liveScore);
    setShowCloseConfirm(false);
    setTab("matches");
  }, [closeMatch, liveScore]);

  const handleReopenMatch = useCallback(async (m) => {
    await reopenMatch(m);
    setTab("live");
  }, [reopenMatch]);

  const renderContent = () => {
    if (dbLoading) return <LoadingScreen />;

    if (analysisMatch) {
      return (
        <MatchAnalysis
          matchEvents={analysisMatch.events || []}
          matchTitle={`${analysisMatch.home} ${analysisMatch.hs}–${analysisMatch.as} ${analysisMatch.away}`}
          matchData={analysisMatch}
          onBack={() => setAnalysisMatch(null)}
          homeTeamName={homeTeam?.name || "Local"}
        />
      );
    }

    switch (tab) {
      case "live":
        return (
          <LiveMatchV2
            events={liveEvents}
            setEvents={setLiveEvents}
            matchInfo={liveMatchInfo}
            homeTeam={homeTeam}
            awayPlayers={awayPlayers}
            persistEvent={persistEvent}
            updatePersistedEvent={updatePersistedEvent}
            onCloseMatch={() => setShowCloseConfirm(true)}
            onStartMatch={() => setShowNewMatch(true)}
            matchStatus={matchStatus}
          />
        );
      case "matches":
        return (
          <Matches
            matchStatus={matchStatus}
            liveMatchInfo={liveMatchInfo}
            liveScore={liveScore}
            completedMatches={completedMatches}
            homeTeam={homeTeam}
            onNewMatch={() => setShowNewMatch(true)}
            onGoLive={() => setTab("live")}
            onViewAnalysis={m => setAnalysisMatch(m)}
            onViewEvolution={m => { setEvoMatch(m); setTab("evolution"); }}
            onDeleteMatch={deleteMatch}
            onReopenMatch={handleReopenMatch}
          />
        );
      case "teams":
        return <Team teams={teams} setTeams={setTeams} onTeamUpdated={onTeamUpdated} />;
      case "evolution":
        return (
          <Evolution
            completedMatches={completedMatches}
            homeTeamName={homeTeam?.name}
            singleMatch={evoMatch}
            onViewMatch={m => setAnalysisMatch(m)}
            goBack={() => setEvoMatch(null)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: T.font, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: "100%", maxWidth: 430, minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", position: "relative" }}>

        {/* Header */}
        <div style={{ padding: "11px 16px 0", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ fontSize: 17 }}>🤾</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: T.text, letterSpacing: 1 }}>HANDBALL PRO</span>
            <span style={{ fontSize: 8, background: T.accent + "22", color: T.accent, border: `1px solid ${T.accent}44`, borderRadius: 7, padding: "1px 5px", fontWeight: 700 }}>v10</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <style>{`@keyframes blinkG{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
            {matchStatus === "live"
              ? <><div style={{ width: 5, height: 5, borderRadius: "50%", background: T.red, animation: "blinkG 1.2s infinite" }} /><span style={{ fontSize: 9, color: T.red, fontWeight: 700 }}>EN VIVO</span></>
              : <><div style={{ width: 5, height: 5, borderRadius: "50%", background: T.muted }} /><span style={{ fontSize: 9, color: T.muted, fontWeight: 600 }}>Sin partido</span></>
            }
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflowY: tab === "live" ? "hidden" : "auto", padding: tab === "live" ? "0" : "14px 14px 88px", WebkitOverflowScrolling: "touch" }}>
          {renderContent()}
        </div>

        {/* Bottom nav */}
        <div style={{
          position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
          width: "100%", maxWidth: 430,
          background: "rgba(6,12,24,.97)", backdropFilter: "blur(16px)",
          borderTop: `1px solid ${T.border}`,
          display: "flex", zIndex: 50,
          paddingBottom: "env(safe-area-inset-bottom,0)",
        }}>
          {NAV.map(n => {
            const active = !analysisMatch && tab === n.k;
            return (
              <button key={n.k}
                onClick={() => { setAnalysisMatch(null); setEvoMatch(null); setTab(n.k); }}
                style={{ flex: 1, background: "transparent", border: "none", cursor: "pointer", padding: "9px 3px 7px", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, position: "relative" }}>
                {active && <div style={{ position: "absolute", top: 0, left: "15%", right: "15%", height: 2, background: T.accent, borderRadius: "0 0 2px 2px" }} />}
                {n.k === "live" && matchStatus === "live" && (
                  <div style={{ position: "absolute", top: 5, right: "16%", width: 6, height: 6, borderRadius: "50%", background: T.red }} />
                )}
                <span style={{ fontSize: 17, lineHeight: 1, filter: active ? "none" : "grayscale(1) opacity(.42)", transform: active ? "scale(1.15)" : "scale(1)", transition: "all .15s" }}>
                  {n.icon}
                </span>
                <span style={{ fontSize: 8, fontWeight: active ? 700 : 500, color: active ? T.accent : T.muted, letterSpacing: 0.4 }}>
                  {n.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {showNewMatch && (
        <NewMatchModal teams={teams} onStart={handleStartMatch} onClose={() => setShowNewMatch(false)} />
      )}
      {showCloseConfirm && (
        <CloseConfirmModal
          liveMatchInfo={liveMatchInfo} liveScore={liveScore}
          onConfirm={handleCloseMatch} onCancel={() => setShowCloseConfirm(false)}
        />
      )}
    </div>
  );
}
