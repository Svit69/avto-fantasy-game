import { Player } from "../models/Player.js";

export class PlayerFactory {
  createPlayersFromCatalog(playerCatalog) {
    return playerCatalog.map((playerData) => new Player(playerData));
  }
}
