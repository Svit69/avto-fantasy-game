import { INITIAL_PLAYERS } from "../data/players.js";
import { AppShellView } from "../views/AppShellView.js";
import { HeaderView } from "../views/HeaderView.js";
import { PlayerSelectionState } from "../models/PlayerSelectionState.js";
import { ApplicationViewFactory } from "../services/ApplicationViewFactory.js";
import { PlayerFactory } from "../services/PlayerFactory.js";
import { RosterFactory } from "../services/RosterFactory.js";
import { PlayerSelectionController } from "./PlayerSelectionController.js";
import { RosterSelectionController } from "./RosterSelectionController.js";

export class AppController {
  constructor(rootElement) {
    this.rootElement = rootElement;
  }

  initializeApplication() {
    const players = new PlayerFactory().createPlayersFromCatalog(INITIAL_PLAYERS);
    const teamRoster = new RosterFactory().createDefaultRoster(players);
    const viewFactory = new ApplicationViewFactory();
    const rosterDomRenderer = viewFactory.createRosterDomRenderer(this.rootElement, teamRoster);

    this.#renderApplicationShell();
    rosterDomRenderer.renderRosterSections();
    new RosterSelectionController(this.rootElement, teamRoster, rosterDomRenderer).connectRosterActions();
    this.#connectPlayerSelection(players, teamRoster, rosterDomRenderer, viewFactory);
  }

  #connectPlayerSelection(players, teamRoster, rosterDomRenderer, viewFactory) {
    const drawerView = viewFactory.createPlayerSelectionDrawerView();
    new PlayerSelectionController(
      this.rootElement, teamRoster, players, rosterDomRenderer, drawerView, new PlayerSelectionState(),
    ).connectPlayerSelectionActions();
  }

  #renderApplicationShell() {
    this.rootElement.innerHTML = new AppShellView(new HeaderView()).render();
    this.#enableBrandLogoFallback();
  }

  #enableBrandLogoFallback() {
    const logoElement = this.rootElement.querySelector("[data-logo]");
    if (!logoElement) return;

    logoElement.addEventListener("error", () => {
      logoElement.outerHTML = `<div class="brand-fallback" role="img" aria-label="Логотип Автомобилиста"></div>`;
    });
  }
}
