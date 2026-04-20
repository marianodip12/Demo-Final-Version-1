import { useState } from "react";
import { supabase } from "../lib/supabase.js";
import { T, POSITIONS, TEAM_COLORS } from "../utils/constants.js";
import { Card, Btn, SectionLabel, Badge, Modal } from "../components/shared.jsx";

export function Team({ teams, setTeams, onTeamUpdated }) {
  const [selTeam, setSelTeam]     = useState(null);
  const [showAddTeam, setShowAddTeam]   = useState(false);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [newTeam, setNewTeam]     = useState({ name: "", color: "#3b82f6" });
  const [newPlayer, setNewPlayer] = useState({ name: "", number: "", position: "Campo" });
  const [saving, setSaving]       = useState(false);

  const addTeam = async () => {
    if (!newTeam.name.trim()) return;
    setSaving(true);
    try {
      const { data } = await supabase.from("teams").insert({ name: newTeam.name.trim(), color: newTeam.color }).select().single();
      if (data) {
        const t = { ...data, players: [] };
        setTeams(prev => [...prev, t]);
        setSelTeam(t);
        setShowAddTeam(false);
        setNewTeam({ name: "", color: "#3b82f6" });
      }
    } catch (e) { console.warn(e); }
    setSaving(false);
  };

  const addPlayer = async () => {
    if (!newPlayer.name.trim() || !newPlayer.number) return;
    setSaving(true);
    try {
      const { data } = await supabase.from("players").insert({
        team_id: selTeam.id,
        name: newPlayer.name.trim(),
        number: parseInt(newPlayer.number),
        position: newPlayer.position,
      }).select().single();
      if (data) {
        const upd = { ...selTeam, players: [...(selTeam.players || []), data] };
        setTeams(prev => prev.map(t => t.id === selTeam.id ? upd : t));
        setSelTeam(upd);
        if (onTeamUpdated) onTeamUpdated(upd);
        setShowAddPlayer(false);
        setNewPlayer({ name: "", number: "", position: "Campo" });
      }
    } catch (e) { console.warn(e); }
    setSaving(false);
  };

  const deletePlayer = async (playerId) => {
    try {
      await supabase.from("players").delete().eq("id", playerId);
      const upd = { ...selTeam, players: selTeam.players.filter(p => p.id !== playerId) };
      setTeams(prev => prev.map(t => t.id === selTeam.id ? upd : t));
      setSelTeam(upd);
      if (onTeamUpdated) onTeamUpdated(upd);
    } catch (e) { console.warn(e); }
  };

  // ─── TEAM DETAIL ────────────────────────────────────────
  if (selTeam) {
    return (
      <div>
        <button onClick={() => setSelTeam(null)}
          style={{ background: "transparent", border: "none", color: T.muted, fontSize: 13, cursor: "pointer", marginBottom: 14, padding: 0, display: "flex", alignItems: "center", gap: 6 }}>
          ← Equipos
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ width: 16, height: 16, borderRadius: "50%", background: selTeam.color, flexShrink: 0 }} />
          <div style={{ fontSize: 20, fontWeight: 800, color: T.text }}>{selTeam.name}</div>
          <Badge label={`${selTeam.players?.length || 0} jugadores`} color={selTeam.color} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
          {(selTeam.players || []).sort((a, b) => a.number - b.number).map(p => (
            <div key={p.id} style={{ background: T.card, borderRadius: 11, border: `1px solid ${T.border}`, padding: "10px 13px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: selTeam.color + "22", border: `2px solid ${selTeam.color}44`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: selTeam.color }}>#{p.number}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{p.name}</div>
                <div style={{ fontSize: 10, color: T.muted }}>{p.position}</div>
              </div>
              <button onClick={() => deletePlayer(p.id)}
                style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", color: T.red, borderRadius: 8, padding: "4px 8px", fontSize: 11, cursor: "pointer" }}>
                ✕
              </button>
            </div>
          ))}
          {(selTeam.players || []).length === 0 && (
            <div style={{ textAlign: "center", padding: "16px", color: T.muted, fontSize: 12 }}>Sin jugadores aún</div>
          )}
        </div>

        <Btn onClick={() => setShowAddPlayer(true)} color={selTeam.color}>+ Agregar jugador</Btn>

        {showAddPlayer && (
          <Modal title="➕ Nuevo Jugador" onClose={() => setShowAddPlayer(false)}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <SectionLabel>NOMBRE</SectionLabel>
                <input value={newPlayer.name} onChange={e => setNewPlayer(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ej: García"
                  style={{ width: "100%", background: T.card2, border: `1px solid ${T.border}`, borderRadius: 10, padding: "11px 14px", color: T.text, fontSize: 14, boxSizing: "border-box" }} />
              </div>
              <div>
                <SectionLabel>NÚMERO</SectionLabel>
                <input type="number" value={newPlayer.number} onChange={e => setNewPlayer(f => ({ ...f, number: e.target.value }))}
                  placeholder="Ej: 7"
                  style={{ width: "100%", background: T.card2, border: `1px solid ${T.border}`, borderRadius: 10, padding: "11px 14px", color: T.text, fontSize: 14, boxSizing: "border-box" }} />
              </div>
              <div>
                <SectionLabel>POSICIÓN</SectionLabel>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {POSITIONS.map(pos => (
                    <button key={pos} onClick={() => setNewPlayer(f => ({ ...f, position: pos }))}
                      style={{ background: newPlayer.position === pos ? selTeam.color + "22" : T.card2, color: newPlayer.position === pos ? selTeam.color : T.muted, border: `1px solid ${newPlayer.position === pos ? selTeam.color : T.border}`, borderRadius: 9, padding: "6px 10px", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>
                      {pos}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn onClick={() => setShowAddPlayer(false)} outline color={T.muted} style={{ flex: 1 }}>Cancelar</Btn>
                <Btn onClick={addPlayer} disabled={saving || !newPlayer.name || !newPlayer.number} color={selTeam.color} style={{ flex: 2 }}>
                  {saving ? "Guardando..." : "✓ Agregar"}
                </Btn>
              </div>
            </div>
          </Modal>
        )}
      </div>
    );
  }

  // ─── TEAMS LIST ─────────────────────────────────────────
  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: T.accent, letterSpacing: 3, textTransform: "uppercase", marginBottom: 4 }}>Gestión</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: T.text }}>Equipos</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
        {teams.map(t => (
          <button key={t.id} onClick={() => setSelTeam(t)}
            style={{ background: T.card, borderRadius: 14, border: `1px solid ${t.color}44`, padding: "13px 14px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", textAlign: "left", width: "100%" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: t.color + "22", border: `2px solid ${t.color}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: t.color }}>{t.name[0]}</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{t.name}</div>
              <div style={{ fontSize: 11, color: T.muted }}>{t.players?.length || 0} jugadores</div>
            </div>
            <span style={{ color: T.muted, fontSize: 16 }}>›</span>
          </button>
        ))}
        {teams.length === 0 && (
          <div style={{ textAlign: "center", padding: "30px", color: T.muted }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>👥</div>
            <div style={{ fontSize: 12 }}>Sin equipos creados aún</div>
          </div>
        )}
      </div>

      <Btn onClick={() => setShowAddTeam(true)} color={T.accent}>+ Nuevo equipo</Btn>

      {showAddTeam && (
        <Modal title="🏐 Nuevo Equipo" onClose={() => setShowAddTeam(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <SectionLabel>NOMBRE DEL EQUIPO</SectionLabel>
              <input value={newTeam.name} onChange={e => setNewTeam(f => ({ ...f, name: e.target.value }))}
                placeholder="Ej: GEI Handball"
                style={{ width: "100%", background: T.card2, border: `1px solid ${T.border}`, borderRadius: 10, padding: "11px 14px", color: T.text, fontSize: 14, boxSizing: "border-box" }} />
            </div>
            <div>
              <SectionLabel>COLOR</SectionLabel>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {TEAM_COLORS.map(c => (
                  <button key={c} onClick={() => setNewTeam(f => ({ ...f, color: c }))}
                    style={{ width: 36, height: 36, borderRadius: "50%", background: c, border: `3px solid ${newTeam.color === c ? "#fff" : "transparent"}`, cursor: "pointer", transition: "border .15s" }} />
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn onClick={() => setShowAddTeam(false)} outline color={T.muted} style={{ flex: 1 }}>Cancelar</Btn>
              <Btn onClick={addTeam} disabled={saving || !newTeam.name.trim()} color={newTeam.color} style={{ flex: 2 }}>
                {saving ? "Guardando..." : "✓ Crear equipo"}
              </Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
