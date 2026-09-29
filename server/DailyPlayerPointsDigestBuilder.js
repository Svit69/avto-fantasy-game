export class DailyPlayerPointsDigestBuilder {
  constructor(messageFactory, impactCalculator) { Object.assign(this, { messageFactory, impactCalculator }); }

  createUserJob(user, rosters, summaries, playersById, notificationDate, matchDate, calendar, matchDatabase) {
    const rows = summaries.flatMap((summary) => this.#createSummaryRows(summary, this.#findRoster(rosters, user, summary.tour?.month), playersById));
    if (!rows.length) return null;
    const month = summaries.find((summary) => summary.tour?.month)?.tour.month;
    const impact = this.impactCalculator.calculateImpact({ roster: this.#findRoster(rosters, user, month), month, matchDate, calendar, matchDatabase });
    const impactedRows = rows.map((row) => ({ ...row, ...(impact.players.get(row.playerId) || { before: 0, after: 0 }) }));
    return { userId: user.id, key: `daily-player-points:${notificationDate}:${user.id}`, parseMode: "HTML",
      text: this.messageFactory.createMessage({ playerRows: impactedRows, matches: this.#findRowMatches(rows), rosterBefore: impact.before, rosterAfter: impact.after }) };
  }

  #createSummaryRows(summary, roster, playersById) {
    const selectedIds = new Set((roster?.slots || []).map((slot) => slot.playerId).filter(Boolean));
    return summary.stats.filter((stat) => selectedIds.has(stat.playerId))
      .map((stat) => this.#createPlayerRow(stat, playersById, summary.match));
  }

  #createPlayerRow(stat, playersById, match) {
    const player = playersById.get(stat.playerId);
    return { ...stat, player, name: player ? `${player.firstName.charAt(0)}. ${player.lastName}` : stat.playerId, match };
  }

  #findRoster(rosters, user, month) {
    return rosters.find((roster) => roster.userId === String(user.id) && roster.month === month);
  }

  #findRowMatches(rows) {
    return [...new Map(rows.map((row) => [row.match.id, row.match])).values()];
  }
}
