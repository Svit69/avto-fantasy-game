import { ROSTER_POSITIONS } from "../data/positions.js";

export class PlayerPastTourView {
  render(player, stats = {}) {
    return `<article class="profile-panel"><h3>Прошлый тур</h3>${this.#renderRows(player, stats)}<footer><b>Итого</b><strong>${Number(stats.fantasyPoints || 0)} оч.</strong></footer></article>`;
  }

  #renderRows(player, stats) {
    return this.#createRows(player, stats).map(([label, value]) => `<div class="profile-season-row"><span>${label}</span><span>${value}</span></div>`).join("");
  }

  #createRows(player, stats) {
    const baseRows = [["Номер игрока", `${player.getNumber() || "—"}`], ["Матчи", `${Number(stats.matches || 0)}`]];
    return player.getPosition() === ROSTER_POSITIONS.goalkeeper
      ? [...baseRows, ...this.#createGoalkeeperRows(stats)]
      : [...baseRows, ...this.#createSkaterRows(stats)];
  }

  #createSkaterRows(stats) {
    return [["Голы", stats.goals], ["Передачи", stats.assists], ["Удаления", stats.penalties], ["Броски в створ", stats.shotsOnGoal], ["Блокированные броски", stats.blockedShots],
      ["Силовые приемы", stats.hits], ["Отборы", stats.takeaways], ["Перехваты", stats.interceptions]].map(this.#formatRow);
  }

  #createGoalkeeperRows(stats) {
    return [["Отраженные броски", stats.saves], ["Пропущенные голы", stats.goalsAgainst], ["Удаления", stats.penalties],
      ["Передачи", stats.assists], ["Голы", stats.goals]].map(this.#formatRow);
  }

  #formatRow([label, value]) { return [label, `${Number(value || 0)}`]; }
}
