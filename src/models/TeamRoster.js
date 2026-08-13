import { RosterSlotCollection } from "../services/RosterSlotCollection.js";
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

  isPositionFull(position) {
    return RosterSlotCollection.isPositionFull(this.#slots, position);
  }

  hasPlayer(player) {
    return RosterSlotCollection.hasPlayer(this.#slots, player);
  }

  addPlayer(player) {
    if (!RosterSlotCollection.canAddPlayer(this.#slots, player)) {
      return this;
    }
    return new TeamRoster(RosterSlotCollection.addPlayerToFirstAvailableSlot(this.#slots, player), this.#budgetLimit);
  }

  removePlayer(playerId) {
    return new TeamRoster(RosterSlotCollection.removePlayerById(this.#slots, playerId), this.#budgetLimit);
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
