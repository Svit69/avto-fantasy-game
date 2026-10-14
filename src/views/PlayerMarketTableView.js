import { PlayerMarketRowView } from "./PlayerMarketRowView.js";
import { PlayerMarketQuery } from "../services/PlayerMarketQuery.js";

export class PlayerMarketTableView {
  constructor(rowView = new PlayerMarketRowView()) { this.rowView = rowView; }

  render(players, teamRoster, filters) {
    const selectedIds = teamRoster.getSelectedPlayerIds();
    return `
      <div class="player-market">
        ${this.#renderHeader(filters)}
        ${new PlayerMarketQuery().selectPlayers(players, filters).map((player) => this.rowView.render(player, selectedIds, teamRoster)).join("") || '<p role="status">Нет подходящих игроков</p>'}
      </div>
    `;
  }

  #renderHeader(filters) {
    return `
      <div class="market-row market-header">
        <div class="market-player-cell">Игрок</div>
        <div class="market-stats-scroll">
          ${Object.entries({ price: "Цена", fantasyPoints: "Очки", selectionPercent: "Выбравшие", goals: "Голы", assists: "Передачи" }).map(([field, label]) =>
            `<span><button type="button" data-market-sort="${field}" aria-label="Сортировать: ${label}" aria-pressed="${filters.sortField === field}">${label} ${filters.sortField === field ? (filters.sortDirection === "asc" ? "↑" : "↓") : "↕"}</button></span>`).join("")}
        </div>
      </div>
    `;
  }

}
