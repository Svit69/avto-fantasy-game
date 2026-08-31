import { INITIAL_PLAYERS } from "../data/players.js";
import { PlayerSelectionState } from "../models/PlayerSelectionState.js";
import { ApplicationViewFactory } from "../services/ApplicationViewFactory.js";
import { MarketStatsScrollSynchronizer } from "../services/MarketStatsScrollSynchronizer.js";
import { PlayerCatalogApiClient } from "../services/PlayerCatalogApiClient.js";
import { PlayerFactory } from "../services/PlayerFactory.js";
import { RosterFactory } from "../services/RosterFactory.js";
import { RosterSubmissionApiClient } from "../services/RosterSubmissionApiClient.js";
import { AppShellView } from "../views/AppShellView.js";
import { HeaderView } from "../views/HeaderView.js";
import { PlayerProfileModalView } from "../views/PlayerProfileModalView.js";
import { AuthGateController } from "./AuthGateController.js";
import { ManagerMenuController } from "./ManagerMenuController.js";
import { PlayerLongPressController } from "./PlayerLongPressController.js";
import { PlayerSelectionController } from "./PlayerSelectionController.js";
import { RosterSelectionController } from "./RosterSelectionController.js";

export class AppController {
  constructor(rootElement) { this.rootElement = rootElement; }
  async initializeApplication() {
    this.#renderApplicationShell();
    const authStatus = await new AuthGateController(this.rootElement).verifyApplicationAuthorization();
    if (!authStatus.authorized) return;
    await this.#initializeAuthorizedApplication();
  }
  async #initializeAuthorizedApplication() {
    const players = new PlayerFactory().createPlayersFromCatalog(await new PlayerCatalogApiClient(INITIAL_PLAYERS).loadPlayerCatalog());
    const teamRoster = new RosterFactory().createDefaultRoster(players);
    const viewFactory = new ApplicationViewFactory();
    const rosterDomRenderer = viewFactory.createRosterDomRenderer(this.rootElement, teamRoster);
    rosterDomRenderer.renderRosterSections(); new ManagerMenuController(this.rootElement).connectManagerMenuActions();
    new RosterSelectionController(this.rootElement, teamRoster, rosterDomRenderer, new RosterSubmissionApiClient()).connectRosterActions();
    this.#connectPlayerSelection(players, teamRoster, rosterDomRenderer, viewFactory); this.#connectPlayerProfiles(players, teamRoster);
  }
  #connectPlayerSelection(players, teamRoster, rosterDomRenderer, viewFactory) {
    const drawerView = viewFactory.createPlayerSelectionDrawerView();
    new PlayerSelectionController(this.rootElement, teamRoster, players, rosterDomRenderer, drawerView,
      new PlayerSelectionState(), new MarketStatsScrollSynchronizer()).connectPlayerSelectionActions();
  }
  #connectPlayerProfiles(players, teamRoster) {
    new PlayerLongPressController(this.rootElement, players, teamRoster, new PlayerProfileModalView()).connectPlayerProfileActions();
  }
  #renderApplicationShell() {
    this.rootElement.innerHTML = new AppShellView(new HeaderView()).render();
    const logoElement = this.rootElement.querySelector("[data-logo]");
    logoElement?.addEventListener("error", () => {
      logoElement.outerHTML = `<div class="brand-fallback" role="img" aria-label="Логотип Автомобилиста"></div>`;
    });
  }
}
