import { MhlOnlineTableReader } from "./MhlOnlineTableReader.js";
import { MhlTeamNameNormalizer } from "./MhlTeamNameNormalizer.js";

export class MhlOnlineStatsParser {
  constructor(reader = new MhlOnlineTableReader()) { this.reader = reader; }
  parseStats(document, game) {
    const playerstats = {};
    for (const side of ["A", "B"]) {
      const rows = this.reader.readRows(document, `#tab-stats${side}-part0 table`, ["#", "Игрок", "Ш", "А", "БВ", "Штр", "БлБ", "СПр", "ОТБ", "ПХТ"]);
      playerstats[side] = [{ period: 0, team: side, data: rows.map((row) => this.#parsePlayer(row, game.players[side])) }];
    }
    const teams = this.reader.readRows(document, "#tab-statsteams-part0 table", ["Команда", "Ш", "БВ"]);
    if (teams.length !== 2) throw new Error("mhl_team_totals_missing");
    const names = [game.teams.home.name, game.teams.visitor.name];
    const data = teams.map((row) => {
      const index = names.indexOf(new MhlTeamNameNormalizer().normalizeTeamName(row.Команда));
      if (index < 0) throw new Error("mhl_stats_team_mismatch");
      return { team: index === 0 ? "A" : "B", stats: { g: this.reader.readCount(row.Ш), shots: this.reader.readCount(row.БВ) } };
    });
    if (new Set(data.map((row) => row.team)).size !== 2) throw new Error("mhl_team_totals_duplicated");
    return { playerstats, teamstats: [{ period: 0, data }] };
  }
  #parsePlayer(row, roster) {
    const player = roster[row["#"]];
    if (!player || player.pos === "в") throw new Error("mhl_stats_roster_mismatch");
    if (!row.Игрок.startsWith(player.name)) throw new Error("mhl_stats_player_name_mismatch");
    return { jn: Number(row["#"]), stats: { g: this.reader.readCount(row.Ш), a: this.reader.readCount(row.А),
      shots: this.reader.readCount(row.БВ), pim: this.reader.readCount(row.Штр), bls: this.reader.readCount(row.БлБ),
      hits: this.reader.readCount(row.СПр), fa: this.reader.readCount(row.ОТБ), p_intc: this.reader.readCount(row.ПХТ),
      sft: "", appearances: Number(player.ig) } };
  }
}
