import { RosterAssetPreloader } from "./RosterAssetPreloader.js";
import { RosterMonthTransitionController } from "../controllers/RosterMonthTransitionController.js";

export class RosterPersistenceCoordinator {
  constructor(rosterFactory, rosterApiClient, calendarApiClient, deadlinePolicy, rosterAssetPreloader = new RosterAssetPreloader()) {
    Object.assign(this, { rosterFactory, rosterApiClient, calendarApiClient, deadlinePolicy, rosterAssetPreloader });
  }

  async createInitialRoster(players, month) {
    return this.#createRosterFromPersistence(players, month);
  }

  connectMonthRosterLoading(rootElement, players, teamRoster, rosterDomRenderer, getSelectedMonth) {
    new RosterMonthTransitionController({ rootElement, teamRoster, rosterFactory: this.rosterFactory, rosterDomRenderer, getSelectedMonth,
      loadRoster: (month) => this.#createRosterFromPersistence(players, month) }).connect();
  }

  async #createRosterFromPersistence(players, month) {
    const [savedRoster, calendar] = await Promise.all([
      this.rosterApiClient.loadSavedRoster(month), this.calendarApiClient.loadFantasyCalendar(),
    ]);
    const mode = this.deadlinePolicy.resolveRosterMode(savedRoster, calendar, month);
    let roster = this.rosterFactory.createRosterFromSavedRoster(players, savedRoster, mode);
    await this.rosterAssetPreloader.preloadRosterVisualAssets(roster);
    const currentMode = this.deadlinePolicy.resolveRosterMode(savedRoster, calendar, month);
    if (currentMode !== mode) roster = this.rosterFactory.createRosterFromSavedRoster(players, savedRoster, currentMode);
    roster.setTourAccessState(this.deadlinePolicy.resolveTourAccessState(calendar, month));
    return roster;
  }
}
