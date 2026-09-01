import { StandingsApiClient } from "../services/StandingsApiClient.js";
import { StandingsModalView } from "../views/StandingsModalView.js";

export class StandingsController {
  constructor(rootElement, getSelectedMonth, apiClient = new StandingsApiClient(), modalView = new StandingsModalView()) {
    Object.assign(this, { rootElement, getSelectedMonth, apiClient, modalView });
  }

  connectStandingsActions() {
    this.rootElement.addEventListener("click", (event) => this.#handleStandingsAction(event));
  }

  async #handleStandingsAction(event) {
    if (event.target.closest("[data-open-standings]")) return this.#openStandings();
    if (event.target.closest("[data-close-standings]")) return this.#closeStandings();
    if (event.target.closest("[data-scroll-current-standing]")) return this.#scrollToCurrentUser();
  }

  async #openStandings() {
    document.body.classList.add("is-standings-open");
    this.#getRoot().innerHTML = this.modalView.render(await this.apiClient.loadMonthlyStandings(this.getSelectedMonth()));
  }

  #closeStandings() {
    document.body.classList.remove("is-standings-open");
    this.#getRoot().innerHTML = "";
  }

  #scrollToCurrentUser() {
    this.rootElement.querySelector(".standings-row.is-current-user")?.scrollIntoView({ block: "center", behavior: "smooth" });
  }

  #getRoot() { return this.rootElement.querySelector("[data-standings-root]"); }
}
