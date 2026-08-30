export class RosterSlot {
  static #nextIndex = 0;

  #index;
  #position;
  #player;

  constructor(position, player = null) {
    this.#index = RosterSlot.#nextIndex;
    RosterSlot.#nextIndex += 1;
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
