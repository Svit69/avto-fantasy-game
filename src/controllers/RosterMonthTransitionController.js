export class RosterMonthTransitionController {
  #revision = 0;
  constructor(options) { Object.assign(this, options); }
  connect() {
    this.rootElement.querySelector(".month-select")?.addEventListener("change", () => { void this.loadSelectedMonth(); });
    this.rootElement.addEventListener("click", (event) => {
      if (event.target.closest("[data-retry-roster-load]")) this.rootElement.querySelector(".month-select")?.dispatchEvent(new Event("change"));
    });
  }
  async loadSelectedMonth() {
    const month = this.getSelectedMonth(); const revision = ++this.#revision;
    this.#showState(month, { isLoading: true });
    try {
      const roster = await this.loadRoster(month);
      if (revision !== this.#revision || month !== this.getSelectedMonth()) return;
      this.teamRoster.replaceRosterState(roster); this.rosterDomRenderer.renderRosterSections();
    } catch {
      if (revision === this.#revision && month === this.getSelectedMonth()) this.#showState(month, { loadingError: true });
    }
  }
  #showState(month, state) {
    const roster = this.rosterFactory.createEmptyRoster("locked");
    roster.setTourAccessState({ month, isOpen: false, isLocked: true, ...state });
    this.teamRoster.replaceRosterState(roster); this.rosterDomRenderer.renderRosterSections();
  }
}
