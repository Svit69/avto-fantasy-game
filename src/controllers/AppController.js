import { INITIAL_PLAYERS } from "../data/players.js";
import { PlayerSelectionState } from "../models/PlayerSelectionState.js";
import { ApplicationShellRenderer } from "../services/ApplicationShellRenderer.js";
import { ApplicationViewFactory } from "../services/ApplicationViewFactory.js"; import { FantasyCalendarApiClient } from "../services/FantasyCalendarApiClient.js";
import { MarketStatsScrollSynchronizer } from "../services/MarketStatsScrollSynchronizer.js";
import { PlayerCatalogApiClient } from "../services/PlayerCatalogApiClient.js";
import { PlayerFactory } from "../services/PlayerFactory.js"; import { PlayerProfileCalendarPresenter } from "../services/PlayerProfileCalendarPresenter.js"; import { PlayerSelectionStatsCoordinator } from "../services/PlayerSelectionStatsCoordinator.js"; import { PlayerTourPointsCoordinator } from "../services/PlayerTourPointsCoordinator.js";
import { RosterFactory } from "../services/RosterFactory.js";
import { RosterPersistenceCoordinator } from "../services/RosterPersistenceCoordinator.js";
import { RosterSubmissionApiClient } from "../services/RosterSubmissionApiClient.js";
import { TourDeadlinePolicy } from "../services/TourDeadlinePolicy.js";
import { PlayerProfileModalView } from "../views/PlayerProfileModalView.js"; import { AuthGateController } from "./AuthGateController.js"; import { DeadlineCountdownController } from "./DeadlineCountdownController.js";
import { ManagerMenuController } from "./ManagerMenuController.js"; import { MonthSelectAvailabilityController } from "./MonthSelectAvailabilityController.js";
import { OnboardingController } from "./OnboardingController.js"; import { PlayerLongPressController } from "./PlayerLongPressController.js"; import { PlayerSelectionController } from "./PlayerSelectionController.js"; import { StandingsController } from "./StandingsController.js";
import { RosterSelectionController } from "./RosterSelectionController.js";
export class AppController {
  constructor(rootElement, shellRenderer = new ApplicationShellRenderer()) { Object.assign(this, { rootElement, shellRenderer }); }
  async initializeApplication() {
    this.shellRenderer.renderApplicationShell(this.rootElement);
    const authStatus = await new AuthGateController(this.rootElement).verifyApplicationAuthorization();
    if (!authStatus.authorized) return;
    await this.#initializeAuthorizedApplication(authStatus.profile);
  }
  async #initializeAuthorizedApplication(authProfile) {
    const players = new PlayerFactory().createPlayersFromCatalog(await new PlayerCatalogApiClient(INITIAL_PLAYERS).loadPlayerCatalog()); const selectionStats = new PlayerSelectionStatsCoordinator(); const tourPoints = new PlayerTourPointsCoordinator(); await Promise.all([selectionStats.applySelectionStats(players, this.#getSelectedMonth()), tourPoints.applyTourPoints(players, this.#getSelectedMonth())]);
    const rosterFactory = new RosterFactory(); const rosterApiClient = new RosterSubmissionApiClient();
    const calendarApiClient = new FantasyCalendarApiClient(); const deadlinePolicy = new TourDeadlinePolicy();
    const persistence = new RosterPersistenceCoordinator(rosterFactory, rosterApiClient, calendarApiClient, deadlinePolicy);
    const teamRoster = await persistence.createInitialRoster(players, this.#getSelectedMonth());
    const viewFactory = new ApplicationViewFactory();
    const rosterDomRenderer = viewFactory.createRosterDomRenderer(this.rootElement, teamRoster);
    rosterDomRenderer.renderRosterSections(); new DeadlineCountdownController(this.rootElement).connectCountdownUpdates();
    new ManagerMenuController(this.rootElement).connectManagerMenuActions();
    await new MonthSelectAvailabilityController(this.rootElement, calendarApiClient, deadlinePolicy.tourSchedulePolicy).applyAvailableTourOptions();
    persistence.connectMonthRosterLoading(this.rootElement, players, teamRoster, rosterDomRenderer, this.#getSelectedMonth.bind(this)); selectionStats.connectMonthSelectionStatsLoading(this.rootElement, players, this.#getSelectedMonth.bind(this)); tourPoints.connectMonthTourPointsLoading(this.rootElement, players, rosterDomRenderer, this.#getSelectedMonth.bind(this));
    new RosterSelectionController(this.rootElement, teamRoster, rosterDomRenderer, rosterApiClient, this.#getSelectedMonth.bind(this), () => selectionStats.applySelectionStats(players, this.#getSelectedMonth())).connectRosterActions();
    this.#connectPlayerSelection(players, teamRoster, rosterDomRenderer, viewFactory); this.#connectPlayerProfiles(players, teamRoster); new StandingsController(this.rootElement, this.#getSelectedMonth.bind(this)).connectStandingsActions();
    new OnboardingController(this.rootElement, authProfile?.userId).connectOnboarding();
  }
  #connectPlayerSelection(players, teamRoster, rosterDomRenderer, viewFactory) {
    const drawerView = viewFactory.createPlayerSelectionDrawerView();
    new PlayerSelectionController(this.rootElement, teamRoster, players, rosterDomRenderer, drawerView,
      new PlayerSelectionState(), new MarketStatsScrollSynchronizer()).connectPlayerSelectionActions();
  }
  #connectPlayerProfiles(players, teamRoster) {
    const calendarPresenter = new PlayerProfileCalendarPresenter(new FantasyCalendarApiClient(), this.#getSelectedMonth.bind(this));
    new PlayerLongPressController(this.rootElement, players, teamRoster, new PlayerProfileModalView(), calendarPresenter).connectPlayerProfileActions();
  }
  #getSelectedMonth() { return this.rootElement.querySelector(".month-select")?.value || "Сентябрь"; }
}
