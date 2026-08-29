import { FantasyEntity } from "./FantasyEntity.js";

export class Player extends FantasyEntity {
  #data;

  constructor(playerData) { super(`${playerData.lastName}-${playerData.position}`); this.#data = { ...playerData }; }

  getFullName() { return `${this.#data.firstName} ${this.#data.lastName}`; }

  getShortDisplayName() { return `${this.#data.firstName.charAt(0)}. ${this.#data.lastName}`; }

  getLastName() { return this.#data.lastName; }

  getTeam() { return this.#data.team; }

  getTeamLogo() { return this.#data.teamLogo; }

  getPosition() { return this.#data.position; }

  getPrice() { return this.#data.price; }

  getImage() { return this.#data.image; }

  getPoints() { return this.#data.points; }

  getNumber() { return this.#data.number; }

  getCardProps(selected) { return { name: this.#data.firstName, id: this.getId(), secondName: this.#data.lastName,
    number: this.#data.number, position: this.#data.position, price: this.#data.price, image: this.#data.image,
    selected, team: this.#data.team, teamLogo: this.#data.teamLogo, leagueLogo: this.#data.leagueLogo,
    points: this.#data.points }; }

  getFormattedPrice() { return `${this.#data.price}к`; }
}
