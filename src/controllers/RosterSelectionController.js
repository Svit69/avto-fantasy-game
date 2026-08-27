export class RosterSelectionController {
  constructor(rootElement, teamRoster, emptyPlayerSlotView, footerView) {
    this.rootElement = rootElement;
    this.teamRoster = teamRoster;
    this.emptyPlayerSlotView = emptyPlayerSlotView;
    this.footerView = footerView;
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
    this.#renderClearedSlot(slotIndex, slotElement);
    this.#renderUpdatedFooter();
  }

  #renderClearedSlot(slotIndex, slotElement) {
    const slot = this.teamRoster.getSlotByIndex(slotIndex);
    if (!slot) return;

    const orderIndex = Number(slotElement.dataset.slotOrder);
    slotElement.innerHTML = this.emptyPlayerSlotView.render(slot.getPosition(), orderIndex);
  }

  #renderUpdatedFooter() {
    this.rootElement.querySelector("[data-roster-footer]").innerHTML =
      this.footerView.render(this.teamRoster);
  }
}
