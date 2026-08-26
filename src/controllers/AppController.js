import { INITIAL_PLAYERS } from "../data/players.js";
import { DraftFieldView } from "../views/DraftFieldView.js";
import { DraftLineupView } from "../views/DraftLineupView.js";
import { EmptyPlayerSlotView } from "../views/EmptyPlayerSlotView.js";
import { FooterView } from "../views/FooterView.js";
import { HeaderView } from "../views/HeaderView.js";
import { PlayerCardView } from "../views/PlayerCardView.js";
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
    const lineupView = new DraftLineupView(
      new PlayerCardView(),
      new EmptyPlayerSlotView(),
    );

    this.rootElement.innerHTML = `
      <div class="app">
        ${new HeaderView().render()}
        ${new DraftFieldView(lineupView).render(teamRoster)}
        ${new FooterView().render(teamRoster)}
      </div>
    `;
  }

  #enableBrandLogoFallback() {
    const logoElement = this.rootElement.querySelector("[data-logo]");
    logoElement.addEventListener("error", () => {
      logoElement.replaceWith(this.#createBrandFallbackElement());
    });
  }

  #createBrandFallbackElement() {
    const fallbackElement = document.createElement("div");
    fallbackElement.className = "brand-fallback";
    fallbackElement.setAttribute("role", "img");
    fallbackElement.setAttribute("aria-label", "Логотип Автомобилиста");
    return fallbackElement;
  }
}
