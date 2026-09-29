import { FantasyScoringGuideModel } from "../models/FantasyScoringGuideModel.js";
import { FantasyScoringGuideView } from "../views/FantasyScoringGuideView.js";

export class ApplicationHelpController {
  constructor(rootElement, view = new FantasyScoringGuideView(), model = new FantasyScoringGuideModel()) {
    Object.assign(this, { rootElement, view, model });
  }

  connectHelpActions() {
    this.rootElement.addEventListener("click", (event) => this.#handleHelpAction(event));
    this.rootElement.addEventListener("keydown", (event) => this.#handleEscapeKey(event));
  }

  #handleHelpAction(event) {
    if (event.target.closest("[data-open-scoring-guide]")) return this.#openScoringGuide();
    if (event.target.closest("[data-close-scoring-guide]")) return this.#closeScoringGuide();
    if (event.target.closest("[data-close-roster-confirmation]")) return this.#closeRosterConfirmation();
  }

  #handleEscapeKey(event) {
    if (event.key !== "Escape") return;
    if (document.body.classList.contains("is-scoring-guide-open")) return this.#closeScoringGuide();
    if (document.body.classList.contains("is-roster-confirmation-open")) this.#closeRosterConfirmation();
  }

  #openScoringGuide() {
    this.#closeRosterConfirmation();
    this.rootElement.querySelector("[data-manager-menu-root]").innerHTML = "";
    this.#getScoringRoot().innerHTML = this.view.render(this.model.createGuide());
    document.body.classList.add("is-scoring-guide-open");
    this.rootElement.querySelector(".scoring-guide footer button")?.focus();
  }

  #closeScoringGuide() { this.#getScoringRoot().innerHTML = ""; document.body.classList.remove("is-scoring-guide-open"); }
  #closeRosterConfirmation() {
    this.rootElement.querySelector("[data-roster-confirmation-root]").innerHTML = "";
    document.body.classList.remove("is-roster-confirmation-open");
    this.rootElement.querySelector("[data-edit-roster]")?.focus();
  }
  #getScoringRoot() { return this.rootElement.querySelector("[data-scoring-guide-root]"); }
}
