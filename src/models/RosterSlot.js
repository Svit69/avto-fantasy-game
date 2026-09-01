export class RosterSlot {
  static #nextIndex = 0;

  #index;
  #position;
  #player;

  constructor(position, player = null, index = null) {
    this.#index = Number.isInteger(index) ? index : RosterSlot.#nextIndex;
    RosterSlot.#nextIndex = Math.max(RosterSlot.#nextIndex, this.#index + 1);
    this.#position = position;
    this.#player = player;
  }

  getIndex() {
    return this.#index;
  }

  getPosition() {
    return this.#position;
  }

  getPlayer() {
    return this.#player;
  }

  clearPlayerSelection() {
    this.#player = null;
  }

  assignPlayerSelection(player) {
    this.#player = player;
  }

  isFilled() {
    return Boolean(this.#player);
  }

  toServerPayload() {
    return {
      slotIndex: this.#index,
      position: this.#position,
      playerId: this.#player?.getId() || null,
    };
  }
}
