import { PlayerMatchStatRowFactory } from "./PlayerMatchStatRowFactory.js";
import { HockeyMatchScoreFormatter } from "../formatters/HockeyMatchScoreFormatter.js";

export class PlayerMatchResultDetailView {
  constructor(statRowFactory = new PlayerMatchStatRowFactory(), scoreFormatter = new HockeyMatchScoreFormatter()) {
    Object.assign(this, { statRowFactory, scoreFormatter });
  }

  render(player, match, homeLogo, awayLogo) {
    if (!match.playerMatchStats) return null;
    const stats = match.playerMatchStats;
    return `<div class="profile-match-result">
      <div class="profile-match-score">${this.#renderTeam(match.homeTeam, homeLogo)}<strong>${this.scoreFormatter.format(stats)}</strong>${this.#renderTeam(match.awayTeam, awayLogo)}</div>
      <dl class="profile-match-stat-list">${this.#renderStatRows(player, stats)}${this.#renderTotal(stats)}</dl>
    </div>`;
  }

  #renderTeam(teamName, logoPath) {
    return `<span>${teamName}<img src="${logoPath}" alt="${teamName}"></span>`;
  }

  #renderStatRows(player, stats) {
    return this.statRowFactory.createRows(player, stats)
      .map((item) => `<div><dt>${item.label}</dt><dd>${item.points} ФО</dd></div>`).join("");
  }

  #renderTotal(stats) {
    return `<div class="profile-match-total"><dt>Итого</dt><dd>${stats.fantasyPoints} ФО</dd></div>`;
  }
}
