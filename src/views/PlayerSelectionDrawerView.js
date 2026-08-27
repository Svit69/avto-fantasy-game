export class PlayerSelectionDrawerView {
  constructor(slotStripView, marketTableView, filterSheetView) {
    this.slotStripView = slotStripView;
    this.marketTableView = marketTableView;
    this.filterSheetView = filterSheetView;
  }

  render(context) {
    const { teamRoster, players, filters, activeFilter, shouldAnimate } = context;
    const filled = teamRoster.calculateFilledPlayersCount();
    const total = teamRoster.calculateTotalSlotsCount();

    return `
      <div class="drawer-backdrop" data-close-player-panel></div>
      <aside class="player-selection-drawer ${shouldAnimate ? "is-entering" : ""}">
        <header class="selection-header">
          <button type="button" data-close-player-panel aria-label="Закрыть">‹</button>
          <strong>${filled}/${total}</strong>
        </header>
        <h2 class="selection-title">Выбор игроков</h2>
        ${this.slotStripView.render(teamRoster)}
        <div class="selection-filters">${this.#renderFilters(filters)}</div>
        ${this.marketTableView.render(players, teamRoster, filters)}
      </aside>
      ${this.filterSheetView.render(activeFilter, filters, this.#selectTeams(players))}
    `;
  }

  #renderFilters(filters) {
    return `
      ${this.#renderFilter("position", "Позиция", this.#formatPosition(filters.position))}
      ${this.#renderFilter("team", "Команда", filters.team)}
      ${this.#renderFilter("price", "Цена", `до ${filters.maxPrice}к`)}
    `;
  }

  #renderFilter(kind, label, value) {
    return `<button type="button" data-open-filter="${kind}"><span>${label}</span><b>${value}</b></button>`;
  }

  #selectTeams(players) {
    return [...new Set(players.map((player) => player.getTeam()))];
  }

  #formatPosition(position) {
    const labels = { Все: "Все", нападающий: "Нападающие", защитник: "Защитники", вратарь: "Вратари" };
    return labels[position] ?? position;
  }
}
