import { FantasyEntity } from "./FantasyEntity.js";

export class Player extends FantasyEntity {
  #firstName;
  #lastName;
  #position;
  #price;

  constructor(playerData) {
    super(`${playerData.lastName}-${playerData.position}`);
    this.#firstName = playerData.firstName;
    this.#lastName = playerData.lastName;
    this.#position = playerData.position;
    this.#price = playerData.price;
  }

  getFullName() {
    return `${this.#firstName} ${this.#lastName}`;
  }

  getLastName() {
    return this.#lastName;
  }

  getPosition() {
    return this.#position;
  }

  getFormattedPrice() {
    return `${this.#price}M`;
  }
}
