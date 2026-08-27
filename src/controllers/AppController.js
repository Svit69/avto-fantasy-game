import { INITIAL_PLAYERS } from "../data/players.js";
import { AppShellView } from "../views/AppShellView.js";
import { DraftFieldView } from "../views/DraftFieldView.js";
import { DraftLineupView } from "../views/DraftLineupView.js";
import { EmptyPlayerSlotView } from "../views/EmptyPlayerSlotView.js";
import { FooterView } from "../views/FooterView.js";
import { HeaderView } from "../views/HeaderView.js";
import { PlayerCardView } from "../views/PlayerCardView.js";
import { PlayerFactory } from "../services/PlayerFactory.js";
import { RosterFactory } from "../services/RosterFactory.js";
import { RosterSelectionController } from "./RosterSelectionController.js";

export class AppController {
  constructor(rootElement) {
    this.rootElement = rootElement;
  }

  initializeApplication() {
    const players = new PlayerFactory().createPlayersFromCatalog(INITIAL_PLAYERS);
    const teamRoster = new RosterFactory().createDefaultRoster(players);
    const draftFieldView = this.#createDraftFieldView();
    const footerView = new FooterView();

    this.#renderApplicationShell();
    this.#renderRosterSections(teamRoster, draftFieldView, footerView);
    new RosterSelectionController(this.rootElement, teamRoster, new EmptyPlayerSlotView(), footerView).connectRosterActions();
  }

  #createDraftFieldView() {
    const lineupView = new DraftLineupView(new PlayerCardView(), new EmptyPlayerSlotView());
    return new DraftFieldView(lineupView);
  }

  #renderApplicationShell() {
    this.rootElement.innerHTML = new AppShellView(new HeaderView()).render();
    this.#enableBrandLogoFallback();
  }

  #renderRosterSections(teamRoster, draftFieldView, footerView) {
    this.rootElement.querySelector("[data-draft-field]").innerHTML = draftFieldView.render(teamRoster);
    this.rootElement.querySelector("[data-roster-footer]").innerHTML = footerView.render(teamRoster);
  }

  #enableBrandLogoFallback() {
    const logoElement = this.rootElement.querySelector("[data-logo]");
    if (!logoElement) return;

    logoElement.addEventListener("error", () => {
      logoElement.outerHTML = `<div class="brand-fallback" role="img" aria-label="Логотип Автомобилиста"></div>`;
    });
  }
}
