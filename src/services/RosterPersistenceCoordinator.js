export class RosterPersistenceCoordinator {
  constructor(rosterFactory, rosterApiClient) {
    Object.assign(this, { rosterFactory, rosterApiClient });
  }

  async createInitialRoster(players, month) {
    const savedRoster = await this.rosterApiClient.loadSavedRoster(month);
    return this.rosterFactory.createRosterFromSavedRoster(players, savedRoster);
  }

  connectMonthRosterLoading(rootElement, players, teamRoster, rosterDomRenderer, getSelectedMonth) {
    rootElement.querySelector(".month-select")?.addEventListener("change", async () => {
      const savedRoster = await this.rosterApiClient.loadSavedRoster(getSelectedMonth());
      const nextRoster = this.rosterFactory.createRosterFromSavedRoster(players, savedRoster);
      teamRoster.replaceSlots(nextRoster.getSlots());
      rosterDomRenderer.renderRosterSections();
    });
  }
}
