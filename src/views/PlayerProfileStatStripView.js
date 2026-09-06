export class PlayerProfileStatStripView {
  render(player) {
    return `<div class="profile-stat-strip">
      ${this.#renderStat("Выбравшие команды", `${player.getSelectionPercent()}%`)}
      ${this.#renderStat("Очки", `${player.getPoints()} оч.`)}
      ${this.#renderStat("Цена", player.getFormattedPrice())}
    </div>`;
  }

  #renderStat(label, value) {
    return `<div><small>${label}</small><strong>${value}</strong></div>`;
  }
}
