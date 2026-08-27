export class PlayerMarketTableView {
  render(players, teamRoster, filters) {
    const selectedIds = teamRoster.getSelectedPlayerIds();
    return `
      <div class="player-market">
        ${this.#renderHeader()}
        ${this.#filterPlayers(players, filters).map((player) => this.#renderRow(player, selectedIds)).join("")}
      </div>
    `;
  }

  #renderHeader() {
    return `
      <div class="market-row market-header">
        <div class="market-player-cell">Игрок</div>
        <div class="market-stats-scroll">
          <span>Цена</span><span>Очки</span><span>Выбравшие команды</span><span>Голы</span><span>Передачи</span>
        </div>
      </div>
    `;
  }

  #renderRow(player, selectedIds) {
    const selected = selectedIds.includes(player.getId());
    return `
      <button class="market-row ${selected ? "is-disabled" : ""}" type="button"
        data-select-player="${player.getId()}" ${selected ? "disabled" : ""}>
        <div class="market-player-cell">
          <img src="${player.getImage()}" alt="${player.getFullName()}" />
          <span><b>${player.getLastName().toUpperCase()}</b><small>${player.getTeam().toUpperCase()}</small></span>
        </div>
        <div class="market-stats-scroll">
          <span><b>${player.getFormattedPrice()}</b><small>${this.#formatPosition(player.getPosition())}</small></span>
          <span>${player.getPoints()}</span><span>0%</span><span>0</span><span>0</span>
        </div>
      </button>
    `;
  }

  #filterPlayers(players, filters) {
    return players.filter((player) => player.getPosition() === filters.position)
      .filter((player) => filters.team === "Все" || player.getTeam() === filters.team)
      .filter((player) => player.getPrice() <= filters.maxPrice);
  }

  #formatPosition(position) {
    const codes = { нападающий: "НАП", защитник: "ЗАЩ", вратарь: "ВРТ" };
    return codes[position] ?? position;
  }
}
