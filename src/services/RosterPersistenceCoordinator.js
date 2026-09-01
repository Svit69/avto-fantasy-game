export class RosterPersistenceCoordinator {
  constructor(rosterFactory, rosterApiClient, calendarApiClient, deadlinePolicy) {
    Object.assign(this, { rosterFactory, rosterApiClient, calendarApiClient, deadlinePolicy });
  }

  async createInitialRoster(players, month) {
    return this.#createRosterFromPersistence(players, month);
  }

  connectMonthRosterLoading(rootElement, players, teamRoster, rosterDomRenderer, getSelectedMonth) {
    rootElement.querySelector(".month-select")?.addEventListener("change", async () => {
      const nextRoster = await this.#createRosterFromPersistence(players, getSelectedMonth());
      teamRoster.replaceRosterState(nextRoster);
      rosterDomRenderer.renderRosterSections();
    });
  }

  async #createRosterFromPersistence(players, month) {
    const [savedRoster, calendar] = await Promise.all([
      this.rosterApiClient.loadSavedRoster(month), this.calendarApiClient.loadFantasyCalendar(),
    ]);
    const mode = this.deadlinePolicy.resolveRosterMode(savedRoster, calendar, month);
    return this.rosterFactory.createRosterFromSavedRoster(players, savedRoster, mode);
  }
}
