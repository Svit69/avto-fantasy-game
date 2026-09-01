export class TeamRoster {
  static CLUB_PLAYER_LIMIT = 3;

  #budgetLimit;
  #slots;
  constructor(budgetLimit, slots) { this.#budgetLimit = budgetLimit; this.#slots = slots; }
  getSlots() { return [...this.#slots]; }
  replaceSlots(slots) { this.#slots = slots; }
  getSlotByIndex(slotIndex) { return this.#slots.find((slot) => slot.getIndex() === slotIndex) ?? null; }
  getBudgetLimit() { return this.#budgetLimit; }
  calculateFilledPlayersCount() { return this.#slots.filter((slot) => slot.isFilled()).length; }
  calculateTotalSlotsCount() { return this.#slots.length; }
  calculateSelectedPlayersPrice() { return this.#slots.reduce((sum, slot) => sum + (slot.isFilled() ? slot.getPlayer().getPrice() : 0), 0); }

  canConfirmRoster() {
    return this.calculateFilledPlayersCount() === this.calculateTotalSlotsCount()
      && this.calculateSelectedPlayersPrice() <= this.#budgetLimit && this.hasValidClubLimits();
  }

  findAvailableSlotForPlayer(activeSlotIndex, player) {
    if (!this.canSelectPlayerFromClub(activeSlotIndex, player)) return null;
    const activeSlot = this.getSlotByIndex(activeSlotIndex);
    if (activeSlot) return activeSlot.getPosition() === player.getPosition() ? activeSlot : null;

    return this.#slots.find((slot) => !slot.isFilled() && slot.getPosition() === player.getPosition()) ?? null;
  }

  canSelectPlayerFromClub(activeSlotIndex, player) { return this.countSelectedPlayersByTeam(player.getTeam(), activeSlotIndex) < TeamRoster.CLUB_PLAYER_LIMIT; }

  countSelectedPlayersByTeam(team, ignoredSlotIndex = null) {
    return this.#slots.filter((slot) => slot.isFilled() && slot.getIndex() !== ignoredSlotIndex)
      .filter((slot) => slot.getPlayer().getTeam() === team).length;
  }

  hasValidClubLimits() { return this.#slots.every((slot) => !slot.isFilled() || this.countSelectedPlayersByTeam(slot.getPlayer().getTeam(), slot.getIndex()) < TeamRoster.CLUB_PLAYER_LIMIT); }
  getSelectedPlayerIds() { return this.#slots.filter((slot) => slot.isFilled()).map((slot) => slot.getPlayer().getId()); }
  createServerPayload() { return this.#slots.map((slot) => slot.toServerPayload()); }
  assignPlayerSelectionAt(slotIndex, player) { if (this.canSelectPlayerFromClub(slotIndex, player)) this.getSlotByIndex(slotIndex)?.assignPlayerSelection(player); }
  clearPlayerSelectionAt(slotIndex) { this.getSlotByIndex(slotIndex)?.clearPlayerSelection(); }
}
