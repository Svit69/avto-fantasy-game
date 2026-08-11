export class RosterSlot {
  #position;
  #player;

  constructor(position, player = null) {
    this.#position = position;
    this.#player = player;
  }

  getPosition() {
    return this.#position;
  }

  getPlayer() {
    return this.#player;
  }

  isFilled() {
    return Boolean(this.#player);
  }

  getActionLabel() {
    return this.isFilled() ? "Убрать игрока" : "Добавить игрока";
  }
}
