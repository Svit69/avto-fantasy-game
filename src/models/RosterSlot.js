export class RosterSlot {
  static #nextIndex = 0;

  #index;
  #position;
  #player;
  #isEditable;

  constructor(position, player = null, index = null, isEditable = true) {
    this.#index = Number.isInteger(index) ? index : RosterSlot.#nextIndex;
    RosterSlot.#nextIndex = Math.max(RosterSlot.#nextIndex, this.#index + 1);
    this.#position = position; this.#player = player; this.#isEditable = isEditable;
  }

  getIndex() { return this.#index; }
  getPosition() { return this.#position; }
  getPlayer() { return this.#player; }

  isEditable() { return this.#isEditable; }

  setEditable(isEditable) { this.#isEditable = isEditable; }

  clearPlayerSelection() { this.#player = null; }
  assignPlayerSelection(player) { this.#player = player; }
  isFilled() { return Boolean(this.#player); }

  toServerPayload() {
    return {
      slotIndex: this.#index,
      position: this.#position,
      playerId: this.#player?.getId() || null,
      lockedPrice: this.#player?.getPrice() ?? null,
    };
  }
}
