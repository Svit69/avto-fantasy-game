export class PlayerMarketTableView {
  render(players, teamRoster, filters) {
    const selectedIds = teamRoster.getSelectedPlayerIds();
    return `
      <div class="player-market">
        ${this.#renderHeader()}
        ${this.#filterPlayers(players, filters).map((player) => this.#renderRow(player, selectedIds, teamRoster)).join("")}
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

  #renderRow(player, selectedIds, teamRoster) {
    const disabled = selectedIds.includes(player.getId()) || !teamRoster.findAvailableSlotForPlayer(null, player);
    return `
      <button class="market-row ${disabled ? "is-disabled" : ""}" type="button"
        data-select-player="${player.getId()}" ${disabled ? "disabled" : ""}>
        <div class="market-player-cell">
          <span class="market-player-avatar"><img src="${player.getImage()}" alt="${player.getFullName()}" /></span>
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
    return players.filter((player) => filters.position === "Все" || player.getPosition() === filters.position)
      .filter((player) => (filters.team === "Все" || player.getTeam() === filters.team) && player.getPrice() <= filters.maxPrice)
      .sort((firstPlayer, secondPlayer) => secondPlayer.getPrice() - firstPlayer.getPrice());
  }

  #formatPosition(position) {
    const codes = { нападающий: "НАП", защитник: "ЗАЩ", вратарь: "ВРТ" };
    return codes[position] ?? position;
  }
}
