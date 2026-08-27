export class TeamRoster {
  #budgetLimit;
  #slots;

  constructor(budgetLimit, slots) {
    this.#budgetLimit = budgetLimit;
    this.#slots = slots;
  }

  getSlots() {
    return [...this.#slots];
  }

  getSlotByIndex(slotIndex) {
    return this.#slots.find((slot) => slot.getIndex() === slotIndex) ?? null;
  }

  getBudgetLimit() {
    return this.#budgetLimit;
  }

  calculateFilledPlayersCount() {
    return this.#slots.filter((slot) => slot.isFilled()).length;
  }

  calculateTotalSlotsCount() {
    return this.#slots.length;
  }

  calculateSelectedPlayersPrice() {
    return this.#slots.reduce((sum, slot) => {
      return slot.isFilled() ? sum + slot.getPlayer().getPrice() : sum;
    }, 0);
  }

  canConfirmRoster() {
    return this.calculateFilledPlayersCount() === this.calculateTotalSlotsCount()
      && this.calculateSelectedPlayersPrice() <= this.#budgetLimit;
  }

  getSelectedPlayerIds() {
    return this.#slots.filter((slot) => slot.isFilled())
      .map((slot) => slot.getPlayer().getId());
  }

  assignPlayerSelectionAt(slotIndex, player) {
    this.getSlotByIndex(slotIndex)?.assignPlayerSelection(player);
  }

  clearPlayerSelectionAt(slotIndex) {
    this.getSlotByIndex(slotIndex)?.clearPlayerSelection();
  }
}
