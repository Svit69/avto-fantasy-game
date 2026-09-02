import { PLAYER_NUMBERS } from "./playerNumbers.js";

const avtoLogo = "/assets/avto_logo.png";
const gornyakLogo = "/assets/gornyak_logo.png";
const vhlLogo = "/assets/vhl_logo.svg";
const mhlLogo = "/assets/mhl_logo.svg";
const khlLeague = "КХЛ";
const vhlLeague = "ВХЛ";
const mhlLeague = "МХЛ";

export class PlayerDataFactory {
  createAvtomobilistPlayer(firstName, lastName, key, position, price, imageName) {
    return this.#createPlayer(firstName, lastName, key, position, price, imageName, "Автомобилист", khlLeague, avtoLogo, "");
  }

  createGornyakPlayer(firstName, lastName, key, position, price, imageName) {
    return this.#createPlayer(firstName, lastName, key, position, price, imageName, "Горняк-УГМК", vhlLeague, gornyakLogo, vhlLogo);
  }

  createMhkAutoPlayer(firstName, lastName, key, position, price, imageName) {
    return this.#createPlayer(firstName, lastName, key, position, price, imageName, "МХК Авто", mhlLeague, avtoLogo, mhlLogo);
  }

  #createPlayer(firstName, lastName, key, position, price, imageName, team, league, teamLogo, leagueLogo) {
    return { key, id: key, firstName, lastName, number: PLAYER_NUMBERS[key], position,
      price, points: 0, team, league, teamLogo, leagueLogo, image: `/assets/players/${imageName}.png` };
  }
}
