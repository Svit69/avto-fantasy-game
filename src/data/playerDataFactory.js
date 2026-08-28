import { PLAYER_NUMBERS } from "./playerNumbers.js";

const avtoLogo = "/assets/avto_logo.png";
const gornyakLogo = "/assets/gornyak_logo.png";
const vhlLogo = "/assets/vhl_logo.svg";

export class PlayerDataFactory {
  createAvtomobilistPlayer(firstName, lastName, key, position, price, imageName) {
    return this.#createPlayer(firstName, lastName, key, position, price, imageName, "Автомобилист", avtoLogo, "");
  }

  createGornyakPlayer(firstName, lastName, key, position, price, imageName) {
    return this.#createPlayer(firstName, lastName, key, position, price, imageName, "Горняк-УГМК", gornyakLogo, vhlLogo);
  }

  #createPlayer(firstName, lastName, key, position, price, imageName, team, teamLogo, leagueLogo) {
    return { firstName, lastName, number: PLAYER_NUMBERS[key],
      position, price, points: 0, team, teamLogo, leagueLogo, image: `/assets/players/${imageName}.png` };
  }
}
