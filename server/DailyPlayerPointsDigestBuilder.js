export class DailyPlayerPointsDigestBuilder {
  constructor(messageFactory) { this.messageFactory = messageFactory; }

  createUserJob(user, rosters, summaries, playersById, notificationDate, matchDate) {
    const rows = summaries.flatMap((summary) => this.#createSummaryRows(summary, this.#findRoster(rosters, user, summary.tour?.month), playersById));
    if (!rows.length) return null;
    return { userId: user.id, key: `daily-player-points:${notificationDate}:${user.id}`,
      text: this.messageFactory.createMessage({ managerName: user.name, matchDate, playerRows: rows, matches: this.#findRowMatches(rows) }) };
  }

  #createSummaryRows(summary, roster, playersById) {
    const selectedIds = new Set((roster?.slots || []).map((slot) => slot.playerId).filter(Boolean));
    return summary.stats.filter((stat) => selectedIds.has(stat.playerId) && Number(stat.fantasyPoints || 0))
      .map((stat) => this.#createPlayerRow(stat, playersById, summary.match));
  }

  #createPlayerRow(stat, playersById, match) {
    const player = playersById.get(stat.playerId);
    return { ...stat, name: player ? `${player.firstName.charAt(0)}. ${player.lastName}` : stat.playerId, match };
  }

  #findRoster(rosters, user, month) {
    return rosters.find((roster) => roster.userId === String(user.id) && roster.month === month);
  }

  #findRowMatches(rows) {
    return [...new Map(rows.map((row) => [row.match.id, row.match])).values()];
  }
}
