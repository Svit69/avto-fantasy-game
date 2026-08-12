import { FantasyEntity } from "./FantasyEntity.js";

export class Player extends FantasyEntity {
  #position;
  #price;
  #club;

  constructor({ id, name, position, price, club }) {
    super(id, name);
    this.#position = position;
    this.#price = price;
    this.#club = club;
  }

  getPosition() {
    return this.#position;
  }

  getPrice() {
    return this.#price;
  }

  getClub() {
    return this.#club;
  }
}
