import { FantasyEntity } from "./FantasyEntity.js";

export class Player extends FantasyEntity {
  #firstName;
  #lastName;
  #birthDate;
  #position;
  #price;
  #photoFileName;
  #club;

  constructor(playerData) {
    super(playerData.id, `${playerData.firstName} ${playerData.lastName}`);
    this.#firstName = playerData.firstName;
    this.#lastName = playerData.lastName;
    this.#birthDate = playerData.birthDate;
    this.#position = playerData.position;
    this.#price = playerData.price;
    this.#photoFileName = playerData.photoFileName;
    this.#club = playerData.club;
  }

  getFirstName() {
    return this.#firstName;
  }

  getLastName() {
    return this.#lastName;
  }

  getBirthDate() {
    return this.#birthDate;
  }

  getPhotoFileName() {
    return this.#photoFileName;
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
