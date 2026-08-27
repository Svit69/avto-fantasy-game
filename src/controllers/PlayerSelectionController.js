export class PlayerSelectionController {
  constructor(rootElement, teamRoster, players, rosterDomRenderer, drawerView, state) {
    Object.assign(this, { rootElement, teamRoster, players, rosterDomRenderer, drawerView, state });
  }
  connectPlayerSelectionActions() {
    this.rootElement.addEventListener("click", (event) => this.#handleSelectionAction(event));
  }
  #handleSelectionAction(event) {
    if (event.target.closest("[data-remove-slot]")) return this.#renderDrawer();
    if (event.target.closest(".empty-player-slot")) return this.#openDrawer(event);
    if (event.target.closest("[data-close-player-panel]")) return this.#closeDrawer();
    if (event.target.closest("[data-close-filter]")) return this.#closeFilter();
    if (event.target.closest("[data-open-filter]")) return this.#openFilter(event);
    if (event.target.closest("[data-filter-value]")) return this.#applyFilter(event);
    if (event.target.closest("[data-select-player]")) return this.#selectPlayer(event);
  }
  #openDrawer(event) {
    const slotIndex = Number(event.target.closest("[data-roster-slot]").dataset.rosterSlot);
    this.state.openForSlot(this.teamRoster.getSlotByIndex(slotIndex));
    this.#renderDrawer();
  }
  #closeDrawer() { this.state.closeDrawer(); this.#renderDrawer(); }

  #openFilter(event) {
    this.state.openFilter(event.target.closest("[data-open-filter]").dataset.openFilter);
    this.#renderDrawer();
  }

  #closeFilter() { this.state.closeFilter(); this.#renderDrawer(); }

  #applyFilter(event) {
    const option = event.target.closest("[data-filter-value]");
    this.state.applyFilter(option.dataset.filterKind, option.dataset.filterValue);
    this.#closeFilter();
  }
  #selectPlayer(event) {
    const playerId = event.target.closest("[data-select-player]").dataset.selectPlayer;
    const player = this.players.find((candidate) => candidate.getId() === playerId);
    const slot = this.teamRoster.getSlotByIndex(this.state.activeSlotIndex);
    if (!player || !slot || player.getPosition() !== slot.getPosition()) return;

    this.teamRoster.assignPlayerSelectionAt(this.state.activeSlotIndex, player);
    this.rosterDomRenderer.renderSlotByIndex(this.state.activeSlotIndex);
    this.rosterDomRenderer.renderFooter();
    this.#closeDrawer();
  }
  #renderDrawer() {
    const root = this.rootElement.querySelector("[data-player-selection-root]");
    root.innerHTML = this.state.isOpen() ? this.drawerView.render(this.#createContext()) : "";
  }
  #createContext() {
    return { teamRoster: this.teamRoster, players: this.players, filters: this.state.filters, activeFilter: this.state.activeFilter };
  }
}
