import { PlayerMarketRowView } from "./PlayerMarketRowView.js";

export class PlayerMarketTableView {
  constructor(rowView = new PlayerMarketRowView()) { this.rowView = rowView; }

  render(players, teamRoster, filters) {
    const selectedIds = teamRoster.getSelectedPlayerIds();
    return `
      <div class="player-market">
        ${this.#renderHeader()}
        ${this.#filterPlayers(players, filters).map((player) => this.rowView.render(player, selectedIds, teamRoster)).join("")}
      </div>
    `;
  }

  #renderHeader() {
    return `
      <div class="market-row market-header">
        <div class="market-player-cell">Игрок</div>
        <div class="market-stats-scroll">
          <span>Цена ↓</span><span>Очки ↕</span><span>Выбравшие ↕</span><span>Голы ↕</span><span>Передачи ↕</span>
        </div>
      </div>
    `;
  }

  #filterPlayers(players, filters) {
    return players.filter((player) => filters.position === "Все" || player.getPosition() === filters.position)
      .filter((player) => (filters.team === "Все" || player.getTeam() === filters.team) && player.getPrice() <= filters.maxPrice)
      .sort((firstPlayer, secondPlayer) => secondPlayer.getPrice() - firstPlayer.getPrice());
  }
}
