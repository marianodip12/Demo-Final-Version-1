import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase.js";
import { mapDbEvent, mapDbMatch } from "../utils/calculations.js";
import { T } from "../utils/constants.js";

export function useSupabaseData() {
  const [teams, setTeams]                       = useState([]);
  const [selTeamId, setSelTeamId]               = useState(null);
  const [liveEvents, setLiveEvents]             = useState([]);
  const [matchStatus, setMatchStatus]           = useState("idle");
  const [liveMatchInfo, setLiveMatchInfo]       = useState({ home: "", away: "", date: null, competition: "Liga" });
  const [liveMatchId, setLiveMatchId]           = useState(null);
  const [awayPlayers, setAwayPlayers]           = useState([]);
  const [completedMatches, setCompletedMatches] = useState([]);
  const [dbLoading, setDbLoading]               = useState(true);

  const homeTeam = teams.find(t => t.id === selTeamId) || teams[0] || null;

  // ─── INITIAL LOAD ───────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const localMatch  = localStorage.getItem("hb_live_match");
        const localEvents = localStorage.getItem("hb_live_events");

        if (localMatch) {
          const m   = JSON.parse(localMatch);
          const evs = localEvents ? JSON.parse(localEvents) : [];
          setLiveMatchInfo({ home: m.home, away: m.away, date: null, competition: m.competition || "Liga" });
          setLiveMatchId(m.id || null);
          setLiveEvents(evs);
          setMatchStatus("live");
          if (m.selTeamId) setSelTeamId(m.selTeamId);
        }

        const { data: teamsData } = await supabase.from("teams").select("*, players(*)").order("created_at");
        if (teamsData?.length) {
          setTeams(teamsData.map(t => ({ ...t, players: t.players || [] })));
          if (!localMatch) setSelTeamId(teamsData[0].id);
        }

        const { data: closed } = await supabase
          .from("matches")
          .select("*, events(*)")
          .eq("status", "closed")
          .order("created_at", { ascending: false })
          .limit(50);
        if (closed?.length) setCompletedMatches(closed.map(mapDbMatch));

        if (!localMatch) {
          const { data: live } = await supabase
            .from("matches")
            .select("*, events(*)")
            .eq("status", "live")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (live) {
            const evs = (live.events || []).map(mapDbEvent).sort((a, b) => a.min - b.min);
            setLiveMatchId(live.id);
            setLiveMatchInfo({ home: live.home_name, away: live.away_name, date: null, competition: live.competition || "Liga" });
            setLiveEvents(evs);
            setMatchStatus("live");
            localStorage.setItem("hb_live_match", JSON.stringify({ id: live.id, home: live.home_name, away: live.away_name, competition: live.competition }));
            localStorage.setItem("hb_live_events", JSON.stringify(evs));
          }
        }
      } catch (e) {
        console.warn("load error", e);
      } finally {
        setDbLoading(false);
      }
    };
    load();
  }, []);

  // ─── SYNC LOCALSTORAGE ──────────────────────────────────
  useEffect(() => {
    if (matchStatus === "live") localStorage.setItem("hb_live_events", JSON.stringify(liveEvents));
  }, [liveEvents, matchStatus]);

  useEffect(() => {
    if (matchStatus === "live" && liveMatchInfo.home) {
      localStorage.setItem("hb_live_match", JSON.stringify({
        id: liveMatchId, home: liveMatchInfo.home, away: liveMatchInfo.away,
        competition: liveMatchInfo.competition, selTeamId,
      }));
    }
    if (matchStatus === "idle") {
      localStorage.removeItem("hb_live_match");
      localStorage.removeItem("hb_live_events");
    }
  }, [matchStatus, liveMatchInfo, liveMatchId, selTeamId]);

  // ─── TEAM CALLBACKS ─────────────────────────────────────
  const onTeamUpdated = useCallback((t) => {
    setTeams(prev => prev.map(x => x.id === t.id ? t : x));
  }, []);

  // ─── START MATCH ────────────────────────────────────────
  const startMatch = useCallback(async ({ teamId, awayName, competition, round, rivalPlayers = [] }) => {
    const team = teams.find(t => t.id === teamId) || homeTeam;
    let matchId = null;

    try {
      const { data } = await supabase.from("matches").insert({
        home_name: team?.name || "Local",
        away_name: awayName,
        home_color: team?.color || T.accent,
        away_color: "#64748b",
        status: "live",
        competition: competition || "Liga",
        round: round || null,
      }).select().single();
      if (data) matchId = data.id;
    } catch (e) { console.warn(e); }

    let loadedPlayers = rivalPlayers;
    if (awayName.trim()) {
      try {
        let { data: rival } = await supabase
          .from("rival_teams")
          .select("*, rival_players(*)")
          .ilike("name", awayName.trim())
          .maybeSingle();

        if (!rival) {
          const { data: newRival } = await supabase.from("rival_teams").insert({ name: awayName.trim() }).select().single();
          rival = newRival;
        }

        if (rival?.id && rivalPlayers.length > 0) {
          const existing = (rival.rival_players || []).map(p => p.number);
          const toInsert = rivalPlayers.filter(p => !existing.includes(p.number));
          if (toInsert.length > 0) {
            await supabase.from("rival_players").insert(
              toInsert.map(p => ({ rival_team_id: rival.id, name: p.name, number: p.number, position: p.position || "Campo" }))
            );
          }
          const { data: allP } = await supabase.from("rival_players").select("*").eq("rival_team_id", rival.id);
          loadedPlayers = allP || rivalPlayers;
        } else if (rival?.rival_players?.length) {
          loadedPlayers = rival.rival_players;
        }
      } catch (e) { console.warn(e); }
    }

    setAwayPlayers(loadedPlayers);
    if (matchId) setLiveMatchId(matchId);
    setSelTeamId(teamId || selTeamId);
    setLiveMatchInfo({ home: team?.name || "Local", away: awayName, date: null, competition: competition || "Liga" });
    setLiveEvents([]);
    setMatchStatus("live");
  }, [teams, homeTeam, selTeamId]);

  // ─── PERSIST EVENT ──────────────────────────────────────
  const persistEvent = useCallback(async (ev) => {
    if (!liveMatchId) return ev.id;
    try {
      const { data } = await supabase.from("events").insert({
        match_id: liveMatchId,
        minute: ev.min,
        team: ev.team,
        type: ev.type,
        zone: ev.zone,
        quadrant: ev.quadrant,
        attack_side: ev.attackSide || null,
        distance: ev.distance || null,
        situation: ev.situation || null,
        throw_type: ev.throwType || null,
        shooter_name: ev.shooter?.name || null,
        shooter_number: ev.shooter?.number || null,
        goalkeeper_name: ev.goalkeeper?.name || null,
        goalkeeper_number: ev.goalkeeper?.number || null,
        sanctioned_name: ev.sanctioned?.name || null,
        sanctioned_number: ev.sanctioned?.number || null,
        h_score: ev.hScore || 0,
        a_score: ev.aScore || 0,
        completed: ev.completed || false,
        quick_mode: ev.quickMode || false,
      }).select().single();
      return data?.id || ev.id;
    } catch (e) { console.warn(e); return ev.id; }
  }, [liveMatchId]);

  // ─── UPDATE EVENT ───────────────────────────────────────
  const updatePersistedEvent = useCallback(async (id, upd) => {
    try {
      await supabase.from("events").update({
        zone: upd.zone,
        quadrant: upd.quadrant,
        type: upd.type,
        shooter_name: upd.shooter?.name || null,
        shooter_number: upd.shooter?.number || null,
        goalkeeper_name: upd.goalkeeper?.name || null,
        goalkeeper_number: upd.goalkeeper?.number || null,
        completed: true,
      }).eq("id", id);
    } catch (e) { console.warn(e); }
  }, []);

  // ─── CLOSE MATCH ────────────────────────────────────────
  const closeMatch = useCallback(async (liveScore) => {
    const date = new Date().toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" });
    if (liveMatchId) {
      try {
        await supabase.from("matches").update({
          home_score: liveScore.h,
          away_score: liveScore.a,
          status: "closed",
          match_date: date,
        }).eq("id", liveMatchId);
      } catch (e) { console.warn(e); }
    }
    const nm = {
      id: liveMatchId || Date.now(),
      home: liveMatchInfo.home,
      away: liveMatchInfo.away,
      hs: liveScore.h,
      as: liveScore.a,
      date,
      competition: liveMatchInfo.competition,
      hc: homeTeam?.color || T.accent,
      ac: "#64748b",
      events: [...liveEvents],
    };
    setCompletedMatches(prev => [nm, ...prev]);
    setLiveEvents([]);
    setLiveMatchId(null);
    setMatchStatus("idle");
    localStorage.removeItem("hb_live_match");
    localStorage.removeItem("hb_live_events");
    localStorage.removeItem("hb_timer_half");
    localStorage.removeItem("hb_timer_secs");
    return nm;
  }, [liveMatchId, liveMatchInfo, liveEvents, homeTeam]);

  // ─── DELETE MATCH ───────────────────────────────────────
  const deleteMatch = useCallback(async (id) => {
    try { await supabase.from("matches").delete().eq("id", id); } catch (e) {}
    setCompletedMatches(prev => prev.filter(m => m.id !== id));
  }, []);

  // ─── REOPEN MATCH ───────────────────────────────────────
  const reopenMatch = useCallback(async (m) => {
    try { await supabase.from("matches").update({ status: "live" }).eq("id", m.id); } catch (e) {}
    setLiveMatchId(m.id);
    setLiveMatchInfo({ home: m.home, away: m.away, date: null, competition: m.competition || "Liga" });
    setLiveEvents([...(m.events || [])]);
    setMatchStatus("live");
    setCompletedMatches(prev => prev.filter(x => x.id !== m.id));
  }, []);

  return {
    teams, setTeams, selTeamId, setSelTeamId, homeTeam, onTeamUpdated,
    liveEvents, setLiveEvents, matchStatus, liveMatchInfo, liveMatchId,
    awayPlayers, completedMatches, setCompletedMatches, dbLoading,
    startMatch, persistEvent, updatePersistedEvent, closeMatch, deleteMatch, reopenMatch,
  };
}
