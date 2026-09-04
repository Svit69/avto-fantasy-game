import { StandingsApiClient } from "../services/StandingsApiClient.js";
import { StandingsModalView } from "../views/StandingsModalView.js";
import { ApplicationViewFactory } from "../services/ApplicationViewFactory.js";
import { ManagerRosterPreviewView } from "../views/ManagerRosterPreviewView.js";

export class StandingsController {
  constructor(rootElement, getSelectedMonth, players = [], apiClient = new StandingsApiClient(), modalView = new StandingsModalView()) {
    Object.assign(this, { rootElement, getSelectedMonth, players, apiClient, modalView, previewView: new ManagerRosterPreviewView(), standings: null });
  }

  connectStandingsActions() {
    this.rootElement.addEventListener("click", (event) => this.#handleStandingsAction(event));
  }

  async #handleStandingsAction(event) {
    if (event.target.closest("[data-open-standings]")) return this.#openStandings();
    if (event.target.closest("[data-close-standings]")) return this.#closeStandings();
    if (event.target.closest("[data-back-standings]")) return this.#renderStandings();
    if (event.target.closest("[data-scroll-current-standing]")) return this.#scrollToCurrentUser();
    if (event.target.closest("[data-view-manager-roster]")) return this.#openManagerRoster(event);
  }

  async #openStandings() {
    document.body.classList.add("is-standings-open");
    this.standings = await this.apiClient.loadMonthlyStandings(this.getSelectedMonth());
    this.#renderStandings();
  }
  #renderStandings() { this.#getRoot().innerHTML = this.modalView.render(this.standings); }

  #closeStandings() {
    document.body.classList.remove("is-standings-open");
    this.#getRoot().innerHTML = "";
  }

  #scrollToCurrentUser() {
    this.rootElement.querySelector(".standings-row.is-current-user")?.scrollIntoView({ block: "center", behavior: "smooth" });
  }
  #openManagerRoster(event) {
    const userId = event.target.closest("[data-view-manager-roster]").dataset.viewManagerRoster;
    const entry = this.standings?.entries.find((item) => item.userId === userId);
    if (!entry) return;
    const viewFactory = new ApplicationViewFactory();
    const lineupView = viewFactory.createDraftFieldView(viewFactory.createRosterSlotDomRenderer()).draftLineupView;
    this.#getRoot().innerHTML = this.previewView.render(entry, this.players, lineupView);
  }

  #getRoot() { return this.rootElement.querySelector("[data-standings-root]"); }
}
