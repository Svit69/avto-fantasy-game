import { FantasyEntity } from "./FantasyEntity.js";

export class Player extends FantasyEntity {
  #position;
  #price;

  constructor({ id, name, position, price }) {
    super(id, name);
    this.#position = position;
    this.#price = price;
  }

  getPosition() {
    return this.#position;
  }

  getPrice() {
    return this.#price;
  }
}
