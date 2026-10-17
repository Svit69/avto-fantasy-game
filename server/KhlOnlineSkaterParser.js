export class KhlOnlineSkaterParser {
  constructor(teamName = "Автомобилист") { this.teamName = teamName; }
  parseRows(game, side) {
    const period = game.tab_stats?.playerstats?.[side]?.find((item) => Number(item.period) === 0);
    if (!period?.data?.length) throw new Error("khl_online_player_stats_missing");
    return period.data.map(({ jn, stats }) => {
      const player = game.players?.[side]?.[jn];
      if (!player || !stats || ["g", "a", "shots", "pim", "bls", "hits", "fa", "p_intc", "sft"].some((key) => !(key in stats))) {
        throw new Error("khl_online_player_columns_missing");
      }
      const goals = this.#readCount(stats.g);
      return { team: this.teamName, number: jn, name: player.name, khlPlayerId: String(player.id),
        appearances: stats.appearances ?? (/(?:[1-9]\d*):\d{2}|0:(?!00)[0-5]\d/.test(stats.sft || "") ? 1 : 0),
        goals, assists: this.#readCount(stats.a), shotsOnGoal: Math.max(0, this.#readCount(stats.shots) - goals),
        penalties: Math.ceil(this.#readCount(stats.pim) / 2), blockedShots: this.#readCount(stats.bls),
        hits: this.#readCount(stats.hits), takeaways: this.#readCount(stats.fa), interceptions: this.#readCount(stats.p_intc) };
    });
  }
  #readCount(value) {
    if (value === "" || value == null) return 0;
    const count = Number(value);
    if (!Number.isSafeInteger(count) || count < 0 || count > 500) throw new Error("khl_online_invalid_stat");
    return count;
  }
}
