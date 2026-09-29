import { PlayerMatchStatRowFactory } from "./PlayerMatchStatRowFactory.js";

export class PlayerMatchResultDetailView {
  constructor(statRowFactory = new PlayerMatchStatRowFactory()) { this.statRowFactory = statRowFactory; }

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
    return this.statRowFactory.createRows(player, stats)
      .map((item) => `<div><dt>${item.label}</dt><dd>${item.points} ФО</dd></div>`).join("");
  }

  #renderTotal(stats) {
    return `<div class="profile-match-total"><dt>Итого</dt><dd>${stats.fantasyPoints} ФО</dd></div>`;
  }
}
