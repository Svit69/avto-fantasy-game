export class FantasyEntity {
  #id;
  #name;

  constructor(id, name) {
    if (new.target === FantasyEntity) {
      throw new Error("FantasyEntity is abstract");
    }

    this.#id = id;
    this.#name = name;
  }

  getId() {
    return this.#id;
  }

  getName() {
    return this.#name;
  }
}
