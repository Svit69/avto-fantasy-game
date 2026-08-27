export class RosterSelectionController {
  constructor(rootElement, teamRoster, rosterDomRenderer) {
    this.rootElement = rootElement;
    this.teamRoster = teamRoster;
    this.rosterDomRenderer = rosterDomRenderer;
  }

  connectRosterActions() {
    this.rootElement.addEventListener("click", (event) => {
      this.#handleRosterAction(event);
    });
  }

  #handleRosterAction(event) {
    const removeButton = event.target.closest("[data-remove-slot]");

    if (!removeButton) {
      return;
    }

    const slotIndex = Number(removeButton.dataset.removeSlot);
    const slotElement = removeButton.closest("[data-roster-slot]");
    if (!slotElement) return;

    this.teamRoster.clearPlayerSelectionAt(slotIndex);
    this.rosterDomRenderer.renderSlotByIndex(slotIndex);
    this.rosterDomRenderer.renderFooter();
  }
}
