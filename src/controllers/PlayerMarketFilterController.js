export class PlayerMarketFilterController {
  constructor({ rootElement, state, players, teamRoster, tableView, scrollSynchronizer }) {
    Object.assign(this, { rootElement, state, players, teamRoster, tableView, scrollSynchronizer });
  }
  connectFilterActions() {
    this.rootElement.addEventListener("click", (event) => {
      const button = event.target.closest("[data-market-sort]");
      if (!button) return;
      const field = button.dataset.marketSort;
      const filters = this.state.filters;
      filters.sortDirection = filters.sortField === field && filters.sortDirection === "desc" ? "asc" : "desc";
      filters.sortField = field;
      this.renderFilteredMarket();
    });
    this.rootElement.addEventListener("input", (event) => {
      const input = event.target;
      if (!input.matches("[data-price-filter-range]")) return;
      this.state.applyFilter("price", input.value);
      const range = Number(input.max) - Number(input.min);
      input.style.setProperty("--price-progress", `${range > 0 ? (input.value - input.min) / range * 100 : 100}%`);
      input.previousElementSibling.querySelector("output").value = `до ${input.value}к`;
      const label = this.rootElement.querySelector('[data-open-filter="price"] b');
      if (label) label.textContent = `до ${input.value}к`;
      this.renderFilteredMarket();
    });
    this.rootElement.addEventListener("player-market-stats-updated", () => this.renderFilteredMarket());
  }
  renderFilteredMarket() {
    const market = this.rootElement.querySelector(".player-market");
    if (!this.state.isOpen() || !market) return;
    const top = market.scrollTop;
    const left = market.querySelector(".market-stats-scroll")?.scrollLeft || 0;
    market.outerHTML = this.tableView.render(this.players, this.teamRoster, this.state.filters);
    const replacement = this.rootElement.querySelector(".player-market");
    replacement.scrollTop = top;
    replacement.querySelectorAll(".market-stats-scroll").forEach((element) => { element.scrollLeft = left; });
    this.scrollSynchronizer.connectSynchronizedStatsScroll(replacement);
  }
}
