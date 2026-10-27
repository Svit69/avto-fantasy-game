import { RosterSubmissionFlow } from "../services/RosterSubmissionFlow.js";
import { RosterAnimationController } from "./RosterAnimationController.js";
import { RosterConfirmationCoordinator } from "../services/RosterConfirmationCoordinator.js";
export class RosterSelectionController {
  constructor(rootElement, teamRoster, rosterDomRenderer, rosterSubmissionApiClient, getSelectedMonth, afterRosterSubmit = async () => {}) {
    Object.assign(this, { rootElement, teamRoster, rosterDomRenderer, rosterSubmissionApiClient, getSelectedMonth, afterRosterSubmit });
  }

  connectRosterActions() {
    this.rootElement.addEventListener("click", (event) => this.#handleRosterAction(event));
  }

  #handleRosterAction(event) {
    const editButton = event.target.closest("[data-edit-roster]");
    if (editButton) return this.#enableRosterEditing();
    const confirmButton = event.target.closest("[data-confirm-roster]");
    if (confirmButton) return this.#submitRoster(confirmButton);

    const removeButton = event.target.closest("[data-remove-slot]");
    if (!removeButton) return;
    const slotElement = removeButton.closest("[data-roster-slot]");
    if (!slotElement) return;
    this.#removePlayerFromSlot(Number(removeButton.dataset.removeSlot));
  }

  #removePlayerFromSlot(slotIndex) {
    this.teamRoster.clearPlayerSelectionAt(slotIndex);
    this.rosterDomRenderer.renderSlotByIndex(slotIndex);
    this.rosterDomRenderer.renderFooter();
  }

  async #submitRoster(confirmButton) {
    if (!this.teamRoster.canConfirmRoster()) return;
    return new RosterSubmissionFlow().submitRoster(confirmButton, () => new RosterConfirmationCoordinator(this).confirm());
  }

  #enableRosterEditing() {
    this.teamRoster.markEditing(); this.#animateRosterEdit();
    this.rosterDomRenderer.renderRosterSections();
  }

  #animateRosterEdit() { new RosterAnimationController(this.rootElement).animateRosterEdit(); }
}
