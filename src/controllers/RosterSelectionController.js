export class RosterSelectionController {
  constructor(rootElement, teamRoster, renderApplicationLayout) {
    this.rootElement = rootElement;
    this.teamRoster = teamRoster;
    this.renderApplicationLayout = renderApplicationLayout;
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
    this.teamRoster.clearPlayerSelectionAt(slotIndex);
    this.renderApplicationLayout();
  }
}
