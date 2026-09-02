import { ROSTER_POSITIONS } from "../data/positions.js";

export class PlayerPastTourView {
  render(player) {
    return `<article class="profile-panel"><h3>Прошлый тур</h3>${this.#renderRows(player)}<footer><b>Итого</b><strong>${player.getPoints()} оч.</strong></footer></article>`;
  }

  #renderRows(player) {
    return this.#createRows(player).map(([label, value]) => `<div class="profile-season-row"><span>${label}</span><b>${value}</b></div>`).join("");
  }

  #createRows(player) {
    const baseRows = [["Номер игрока", `${player.getNumber() || "—"}`], ["Матчи", "0"]];
    return player.getPosition() === ROSTER_POSITIONS.goalkeeper
      ? [...baseRows, ...this.#createGoalkeeperRows()]
      : [...baseRows, ...this.#createSkaterRows()];
  }

  #createSkaterRows() {
    return [["Голы", "0 оч."], ["Передачи", "0 оч."], ["Удаления", "0 оч."], ["Броски в створ", "0 оч."],
      ["Силовые приемы", "0 оч."], ["Отборы", "0 оч."], ["Перехваты", "0 оч."]];
  }

  #createGoalkeeperRows() {
    return [["Отраженные броски", "0 оч."], ["Пропущенные голы", "0 оч."], ["Удаления", "0 оч."],
      ["Передачи", "0 оч."], ["Голы", "0 оч."]];
  }
}
