import { PriceRangeFilterController } from "./PriceRangeFilterController.js";
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
    new PriceRangeFilterController({ rootElement: this.rootElement, state: this.state, onChange: () => this.renderFilteredMarket() }).connect();
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
