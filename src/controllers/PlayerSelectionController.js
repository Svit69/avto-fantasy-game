export class PlayerSelectionController {
  constructor(rootElement, teamRoster, players, rosterDomRenderer, drawerView, state, scrollSynchronizer) {
    Object.assign(this, { rootElement, teamRoster, players, rosterDomRenderer, drawerView, state, scrollSynchronizer });
  }
  connectPlayerSelectionActions() { this.rootElement.addEventListener("click", (event) => this.#handleSelectionAction(event)); this.rootElement.addEventListener("input", (event) => this.#handleRangeInput(event)); }
  #handleSelectionAction(event) {
    if (event.target.closest("[data-remove-slot]")) return this.#renderDrawer();
    if (event.target.closest("[data-open-player-panel]")) return this.#openPlayerSearch();
    if (event.target.closest(".empty-player-slot")) return this.#openDrawer(event);
    if (event.target.closest("[data-close-player-panel]")) return this.#closeDrawer();
    if (event.target.closest("[data-close-filter]")) return this.#closeFilter();
    if (event.target.closest("[data-open-filter]")) return this.#openFilter(event);
    if (event.target.closest("[data-filter-value]")) return this.#applyFilter(event);
    if (event.target.closest("[data-select-player]")) return this.#selectPlayer(event);
  }
  #openDrawer(event) {
    const slot = this.teamRoster.getSlotByIndex(Number(event.target.closest("[data-roster-slot]").dataset.rosterSlot));
    this.state.openForSlot(slot); this.#renderDrawer();
  }
  #openPlayerSearch() { this.state.openForPlayerSearch(); this.#renderDrawer(); }
  #closeDrawer() { this.#animateExit(".player-selection-drawer, .drawer-backdrop", () => { this.state.closeDrawer(); this.#renderDrawer(); }); }
  #openFilter(event) { this.state.openFilter(event.target.closest("[data-open-filter]").dataset.openFilter); this.#renderDrawer(); }
  #closeFilter() { this.#animateExit(".filter-sheet, .filter-scrim", () => { this.state.closeFilter(); this.#renderDrawer(); }, 130); }
  #handleRangeInput(event) { if (!event.target.matches("[data-price-filter-range]")) return;
    this.state.applyFilter("price", event.target.value); event.target.previousElementSibling.querySelector("output").value = `до ${event.target.value}к`; }
  #applyFilter(event) {
    const option = event.target.closest("[data-filter-value]");
    this.state.applyFilter(option.dataset.filterKind, option.dataset.filterValue);
    this.#closeFilter();
  }
  #selectPlayer(event) {
    const playerId = event.target.closest("[data-select-player]").dataset.selectPlayer;
    const player = this.players.find((candidate) => candidate.getId() === playerId);
    const slot = player ? this.teamRoster.findAvailableSlotForPlayer(this.state.activeSlotIndex, player) : null;
    if (!slot) return;
    this.teamRoster.assignPlayerSelectionAt(slot.getIndex(), player);
    this.rosterDomRenderer.renderSlotByIndex(slot.getIndex());
    this.rosterDomRenderer.renderFooter(); this.#closeDrawer();
  }
  #renderDrawer() {
    const root = this.rootElement.querySelector("[data-player-selection-root]"); document.body.classList.toggle("is-drawer-open", this.state.isOpen());
    root.innerHTML = this.state.isOpen() ? this.drawerView.render(this.#createContext()) : ""; this.scrollSynchronizer.connectSynchronizedStatsScroll(root);
  }
  #animateExit(selector, afterClose, duration = 160) { this.rootElement.querySelectorAll(selector).forEach((element) => element.classList.add("is-leaving")); setTimeout(afterClose, duration); }
  #createContext() {
    return { teamRoster: this.teamRoster, players: this.players, filters: this.state.filters,
      activeFilter: this.state.activeFilter, shouldAnimate: this.state.consumeDrawerAnimationFlag() };
  }
}
