export class PlayerSelectionDrawerView {
  constructor(slotStripView, marketTableView, filterSheetView, footerView) { Object.assign(this, { slotStripView, marketTableView, filterSheetView, footerView }); }

  render(context) {
    const { teamRoster, players, filters, activeFilter, shouldAnimate } = context;
    const availablePlayers = this.#selectAvailablePlayers(players);
    const priceRange = this.#selectPriceRange(availablePlayers);
    const effectiveFilters = { ...filters, maxPrice: Math.min(filters.maxPrice ?? priceRange.max, priceRange.max) };
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
        <div class="selection-filters">${this.#renderFilters(effectiveFilters)}</div>
        ${this.marketTableView.render(availablePlayers, teamRoster, effectiveFilters)}
        ${this.footerView.render(teamRoster)}
      </aside>
      ${this.filterSheetView.render(activeFilter, effectiveFilters, this.#selectTeams(availablePlayers), priceRange)}
    `;
  }
  #renderFilters(filters) {
    return `
      ${this.#renderFilter("position", "Позиция", this.#formatPosition(filters.position))}
      ${this.#renderFilter("team", "Команда", filters.team)}
      ${this.#renderFilter("price", "Цена", `до ${filters.maxPrice}к`)}
    `;
  }
  #renderFilter(kind, label, value) { return `<button type="button" data-open-filter="${kind}"><span>${label}</span><b>${value}</b></button>`; }
  #selectAvailablePlayers(players) { return players.filter((player) => player.isAvailableForSelection()); }
  #selectTeams(players) { return [...new Set(players.map((player) => player.getTeam()))]; }
  #selectPriceRange(players) {
    const prices = players.map((player) => Math.floor(Number(player.getPrice()))).filter(Number.isFinite);
    if (!prices.length) return { min: 0, max: 0 };
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }
  #formatPosition(position) {
    const labels = { Все: "Все", нападающий: "Нападающие", защитник: "Защитники", вратарь: "Вратари" };
    return labels[position] ?? position;
  }
}
