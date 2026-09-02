import { ROSTER_POSITIONS } from "../data/positions.js";

export class PlayerPastTourView {
  render(player) {
    return `<article class="profile-panel"><h3>Прошлый тур</h3>${this.#renderRows(player)}<footer><b>Итого</b><strong>${player.getPoints()} оч.</strong></footer></article>`;
  }

  #renderRows(player) {
    return this.#createRows(player).map(([label, value]) => `<div class="profile-season-row"><span>${label}</span><span>${value}</span></div>`).join("");
  }

  #createRows(player) {
    const baseRows = [["Номер игрока", `${player.getNumber() || "—"}`], ["Матчи", "0"]];
    return player.getPosition() === ROSTER_POSITIONS.goalkeeper
      ? [...baseRows, ...this.#createGoalkeeperRows()]
      : [...baseRows, ...this.#createSkaterRows()];
  }

  #createSkaterRows() {
    return [["Голы", "0"], ["Передачи", "0"], ["Удаления", "0"], ["Броски в створ", "0"], ["Блокированные броски", "0"],
      ["Силовые приемы", "0"], ["Отборы", "0"], ["Перехваты", "0"]];
  }

  #createGoalkeeperRows() {
    return [["Отраженные броски", "0"], ["Пропущенные голы", "0"], ["Удаления", "0"],
      ["Передачи", "0"], ["Голы", "0"]];
  }
}
