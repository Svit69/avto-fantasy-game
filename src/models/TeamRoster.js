export class TeamRoster {
  #slots;
  #budgetLimit;

  constructor(slots, budgetLimit) {
    this.#slots = slots;
    this.#budgetLimit = budgetLimit;
  }

  getSlotsByPosition(position) {
    return this.#slots.filter((slot) => slot.getPosition() === position);
  }

  calculateSpentBudget() {
    return this.#slots.reduce((total, slot) => {
      return total + (slot.getPlayer()?.getPrice() ?? 0);
    }, 0);
  }

  countFilledSlots() {
    return this.#slots.filter((slot) => slot.isFilled()).length;
  }

  countAvailableSlots() {
    return this.#slots.length;
  }

  getBudgetLimit() {
    return this.#budgetLimit;
  }
}
