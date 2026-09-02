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
    confirmButton.disabled = true;
    await this.rosterSubmissionApiClient.submitConfirmedRoster(this.teamRoster.createServerPayload(), this.getSelectedMonth());
    await this.afterRosterSubmit();
    this.teamRoster.markConfirmed(); this.#animateRosterLock();
    this.rosterDomRenderer.renderRosterSections();
  }

  #enableRosterEditing() {
    this.teamRoster.markEditing(); this.#animateRosterEdit();
    this.rosterDomRenderer.renderRosterSections();
  }

  #animateRosterLock() { this.#setRosterAnimationClass("is-roster-locking", "is-roster-editing"); }
  #animateRosterEdit() { this.#setRosterAnimationClass("is-roster-editing", "is-roster-locking"); }
  #setRosterAnimationClass(nextClass, previousClass) {
    const field = this.rootElement.querySelector("[data-draft-field]");
    field?.classList.remove(previousClass); field?.classList.add(nextClass);
  }
}
