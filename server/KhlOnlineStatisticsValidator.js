export class KhlOnlineStatisticsValidator {
  validateSkaterTotals(game, side, rows) {
    const total = game.tab_stats?.teamstats?.find((period) => Number(period.period) === 0)?.data?.find((item) => item.team === side)?.stats;
    if (!total) throw new Error("khl_online_team_totals_missing");
    const expected = Object.values(game.players?.[side] || {}).filter((player) => player.pos !== "в" && Number(player.ig) === 1);
    if (expected.some((player) => !rows.some((row) => String(row.khlPlayerId) === String(player.id)))) throw new Error("khl_online_skater_totals_mismatch");
    if (new Set(rows.map((row) => row.khlPlayerId)).size !== rows.length) throw new Error("khl_online_duplicate_player");
    const goals = rows.reduce((sum, row) => sum + row.goals, 0);
    const shots = rows.reduce((sum, row) => sum + row.shotsOnGoal + row.goals, 0);
    if (goals !== Number(total.g) || shots !== Number(total.shots)) throw new Error("khl_online_skater_totals_mismatch");
  }
}
