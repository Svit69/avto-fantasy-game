import { MhlTeamNameNormalizer } from "./MhlTeamNameNormalizer.js";

export class MhlOfficialGoalieRowsValidator {
  validateRows(rows, game) {
    const normalize = (name) => new MhlTeamNameNormalizer().normalizeTeamName(name);
    return Object.fromEntries(["A", "B"].map((side) => {
      const team = side === "A" ? game.teams.home.name : game.teams.visitor.name;
      const selected = rows.filter((row) => normalize(row.team) === team);
      if (!selected.length || new Set(selected.map((row) => String(row.number))).size !== selected.length) throw Error("mhl_protocol_goalies_missing");
      if (!selected.some((row) => row.appearances === 1)) throw Error("mhl_protocol_goalies_missing");
      for (const row of selected) {
        const player = game.players[side][row.number];
        if (player?.pos !== "в" || !this.#samePlayerName(player.name, row.name)
          || ![0, 1].includes(row.appearances) || ![row.saves, row.goalsAgainst].every((value) => Number.isSafeInteger(value) && value >= 0 && value <= 500)) throw Error("mhl_protocol_goalie_mismatch");
      }
      const opponent = side === "A" ? "B" : "A";
      const totals = game.tab_stats.teamstats.find((period) => Number(period.period) === 0).data.find((item) => item.team === opponent).stats;
      if (selected.reduce((sum, row) => sum + row.saves + row.goalsAgainst, 0) > Number(totals.shots)
        || selected.reduce((sum, row) => sum + row.goalsAgainst, 0) > Number(totals.g)) throw Error("mhl_protocol_goalie_totals_mismatch");
      return [side, selected.map((row) => ({ ...row, team, khlPlayerId: String(game.players[side][row.number].id) }))];
    }));
  }
  #samePlayerName(left, right) {
    const tokens = (name) => String(name).normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/ё/g, "е").trim().split(/\s+/);
    const a = tokens(left); const b = tokens(right);
    return a.length >= 2 && b.length >= 2 && a[0] === b[0] && a[1] === b[1];
  }
}
