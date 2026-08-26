import { FantasyEntity } from "./FantasyEntity.js";

export class Player extends FantasyEntity {
  #data;

  constructor(playerData) {
    super(`${playerData.lastName}-${playerData.position}`);
    this.#data = { ...playerData };
  }

  getFullName() {
    return `${this.#data.firstName} ${this.#data.lastName}`;
  }

  getShortDisplayName() {
    return `${this.#data.firstName.charAt(0)}. ${this.#data.lastName}`;
  }

  getLastName() {
    return this.#data.lastName;
  }

  getPosition() {
    return this.#data.position;
  }

  getNumber() {
    return this.#data.number;
  }

  getCardProps(selected) {
    return {
      name: this.#data.firstName,
      secondName: this.#data.lastName,
      number: this.#data.number,
      position: this.#data.position,
      price: this.#data.price,
      image: this.#data.image,
      selected,
      team: this.#data.team,
      teamLogo: this.#data.teamLogo,
      points: this.#data.points,
    };
  }

  getFormattedPrice() {
    return `${this.#data.price}M`;
  }
}
