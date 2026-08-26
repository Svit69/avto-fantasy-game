import { INITIAL_PLAYERS } from "../data/players.js";
import { DraftFieldView } from "../views/DraftFieldView.js";
import { FooterView } from "../views/FooterView.js";
import { HeaderView } from "../views/HeaderView.js";
import { SlotView } from "../views/SlotView.js";
import { PlayerFactory } from "../services/PlayerFactory.js";
import { RosterFactory } from "../services/RosterFactory.js";

export class AppController {
  constructor(rootElement) {
    this.rootElement = rootElement;
  }

  initializeApplication() {
    const players = new PlayerFactory().createPlayersFromCatalog(INITIAL_PLAYERS);
    const teamRoster = new RosterFactory().createDefaultRoster(players);

    this.#renderApplicationLayout(teamRoster);
    this.#enableBrandLogoFallback();
  }

  #renderApplicationLayout(teamRoster) {
    const headerView = new HeaderView();
    const draftFieldView = new DraftFieldView(new SlotView());
    const footerView = new FooterView();

    this.rootElement.innerHTML = `
      <div class="app">
        ${headerView.render()}
        ${draftFieldView.render(teamRoster)}
        ${footerView.render(teamRoster)}
      </div>
    `;
  }

  #enableBrandLogoFallback() {
    const logoElement = this.rootElement.querySelector("[data-logo]");
    logoElement.addEventListener("error", () => {
      logoElement.replaceWith(this.#createTextLogoElement());
    });
  }

  #createTextLogoElement() {
    const fallbackElement = document.createElement("div");
    fallbackElement.className = "brand-fallback";
    fallbackElement.textContent = "А";
    return fallbackElement;
  }
}
