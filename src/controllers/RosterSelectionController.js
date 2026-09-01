export class RosterSelectionController {
  constructor(rootElement, teamRoster, rosterDomRenderer, rosterSubmissionApiClient, getSelectedMonth) {
    Object.assign(this, { rootElement, teamRoster, rosterDomRenderer, rosterSubmissionApiClient, getSelectedMonth });
  }

  connectRosterActions() {
    this.rootElement.addEventListener("click", (event) => this.#handleRosterAction(event));
  }

  #handleRosterAction(event) {
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
    confirmButton.textContent = "СОСТАВ СОХРАНЁН";
  }
}
