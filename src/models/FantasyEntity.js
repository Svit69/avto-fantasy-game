export class FantasyEntity {
  #id;

  constructor(id) {
    if (new.target === FantasyEntity) {
      throw new Error("FantasyEntity is abstract");
    }

    this.#id = id;
  }

  getId() {
    return this.#id;
  }
}
