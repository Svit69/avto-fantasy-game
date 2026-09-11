export class PlayerMatchResultDetailView {
  render(player, match, homeLogo, awayLogo) {
    if (!match.playerMatchStats) return null;
    const stats = match.playerMatchStats;
    return `<div class="profile-match-result">
      <div class="profile-match-score">${this.#renderTeam(match.homeTeam, homeLogo)}<strong>${this.#formatScore(stats)}</strong>${this.#renderTeam(match.awayTeam, awayLogo)}</div>
      <dl class="profile-match-stat-list">${this.#renderStatRows(player, stats)}${this.#renderTotal(stats)}</dl>
    </div>`;
  }

  #renderTeam(teamName, logoPath) {
    return `<span>${teamName}<img src="${logoPath}" alt="${teamName}"></span>`;
  }

  #formatScore(stats) {
    return stats.homeScore == null || stats.awayScore == null ? "счёт уточняется" : `${stats.homeScore} - ${stats.awayScore}`;
  }

  #renderStatRows(player, stats) {
    return this.#createVisibleStats(player, stats).map((item) => `<div><dt>${item.label}</dt><dd>${item.points} ФО</dd></div>`).join("");
  }

  #createVisibleStats(player, stats) {
    if (player.getPosition() === "вратарь") return this.#createGoalkeeperStats(stats);
    const skaterStats = [{ label: `${stats.goals} гол`, count: stats.goals, points: stats.goals * (player.getPosition() === "защитник" ? 60 : 50) },
      { label: `${stats.assists} передача`, count: stats.assists, points: stats.assists * (player.getPosition() === "защитник" ? 40 : 30) },
      { label: `${stats.shotsOnGoal} бросок в створ`, count: stats.shotsOnGoal, points: stats.shotsOnGoal * 5 },
      { label: `${stats.blockedShots} блок`, count: stats.blockedShots, points: stats.blockedShots * (player.getPosition() === "защитник" ? 10 : 5) },
      { label: `${stats.hits} силовой приём`, count: stats.hits, points: stats.hits * 5 },
      { label: `${stats.penalties} штраф`, count: stats.penalties, points: stats.penalties * -10 }];
    return skaterStats.filter((item) => item.count);
  }

  #createGoalkeeperStats(stats) {
    return [{ label: `${stats.saves} сейв`, count: stats.saves, points: stats.saves * 3 },
      { label: `${stats.goalsAgainst} пропущено`, count: stats.goalsAgainst, points: stats.goalsAgainst * -15 },
      { label: `${stats.penalties} штраф`, count: stats.penalties, points: stats.penalties * -10 }].filter((item) => item.count);
  }

  #renderTotal(stats) {
    return `<div class="profile-match-total"><dt>Итого</dt><dd>${stats.fantasyPoints} ФО</dd></div>`;
  }
}
