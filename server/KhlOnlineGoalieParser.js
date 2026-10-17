import { KhlOnlineGoalieEventStats } from "./KhlOnlineGoalieEventStats.js";

export class KhlOnlineGoalieParser {
  constructor(teamName = "Автомобилист") { this.teamName = teamName; }
  parseRows(game, side) {
    const keepers = Object.values(game.players?.[side] || {}).filter((player) => player.pos === "в" && Number(player.ig) === 1);
    if (!keepers.length) throw new Error("khl_online_goalie_missing");
    const roster = game.players[side];
    const changes = (game.tab_events || []).flatMap((period) => period.events || [])
      .filter((event) => event.type === "gc" && event.teamAB === side).sort((a, b) => a.time_sec - b.time_sec || a.id - b.id);
    let current = changes.length ? Number(changes[0].prevGk) : keepers.length === 1 ? Number(keepers[0].jn) : NaN;
    if (!Number.isFinite(current)) throw new Error("khl_online_goalie_ambiguous");
    const rows = new Map(keepers.map((player) => [Number(player.jn), { team: this.teamName, number: player.jn,
      name: player.name, khlPlayerId: String(player.id), appearances: 1, saves: 0, goalsAgainst: 0 }]));
    const opponent = side === "A" ? "B" : "A";
    const shootout = /^(?:Б|ПБ|SO)$/iu.test(String(game.info?.data?.ots || ""));
    const periods = Object.entries(game.tab_playbyplay?.gameLegend || {}).filter(([period]) => !shootout || Number(period) < 5);
    const shots = periods.flatMap(([, events]) => events).filter((event) => event.teamAB === opponent
      && (event.type === "goal" || event.type === "shot" && event.result === "saved"));
    const total = game.tab_stats?.teamstats?.find((period) => Number(period.period) === 0)?.data?.find((item) => item.team === opponent)?.stats;
    if (!total || shots.length !== Number(total.shots)) throw new Error("khl_online_goalie_events_incomplete");
    const timeline = [...changes.map((event) => ({ time: Number(event.time_sec), change: event })),
      ...shots.map((event) => ({ time: Number(event.time), shot: event }))].sort((a, b) => a.time - b.time || Number(Boolean(a.change)) - Number(Boolean(b.change)));
    for (const entry of timeline) {
      if (entry.change) { current = Number(entry.change.gkJn); continue; }
      if (!current) continue;
      if (!roster[current] || !rows.has(current)) throw new Error("khl_online_goalie_unknown");
      rows.get(current)[entry.shot.type === "goal" ? "goalsAgainst" : "saves"] += 1;
    }
    return new KhlOnlineGoalieEventStats().enrichRows(game, side, [...rows.values()]);
  }
}
