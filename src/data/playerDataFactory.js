import { PLAYER_NUMBERS } from "./playerNumbers.js";

const avtoLogo = "/assets/avto_logo.png";
const gornyakLogo = "/assets/gornyak_logo.png";
const vhlLogo = "/assets/vhl_logo.svg";
const mhlLogo = "/assets/mhl_logo.svg";

export class PlayerDataFactory {
  createAvtomobilistPlayer(firstName, lastName, key, position, price, imageName, extras = {}) {
    return this.#createPlayer(firstName, lastName, key, position, price, imageName, "Автомобилист", "КХЛ", avtoLogo, "", extras);
  }

  createGornyakPlayer(firstName, lastName, key, position, price, imageName, extras = {}) {
    return this.#createPlayer(firstName, lastName, key, position, price, imageName, "Горняк-УГМК", "ВХЛ", gornyakLogo, vhlLogo, extras);
  }

  createMhkAutoPlayer(firstName, lastName, key, position, price, imageName, extras = {}) {
    return this.#createPlayer(firstName, lastName, key, position, price, imageName, "МХК Авто", "МХЛ", avtoLogo, mhlLogo, extras);
  }

  #createPlayer(firstName, lastName, key, position, price, imageName, team, league, teamLogo, leagueLogo, extras) {
    return { key, id: key, firstName, lastName, number: PLAYER_NUMBERS[key], position,
      price, points: 0, team, league, teamLogo, leagueLogo, image: `/assets/players/${imageName}.png`, ...extras };
  }
}
