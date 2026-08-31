import { RosterSlot } from "../models/RosterSlot.js";
import { TeamRoster } from "../models/TeamRoster.js";

export class RosterFactory {
  createDefaultRoster(players) {
    const slots = [
      new RosterSlot("нападающий", this.#findPlayerByLastName(players, "Голышев")),
      new RosterSlot("нападающий"),
      new RosterSlot("нападающий", this.#findPlayerByLastName(players, "Спронг")),
      new RosterSlot("защитник", this.#findPlayerByLastName(players, "Трямкин")),
      new RosterSlot("защитник"),
      new RosterSlot("вратарь"),
    ];

    return new TeamRoster(80, slots);
  }

  #findPlayerByLastName(players, lastName) {
    return players.find((player) => player.getLastName() === lastName);
  }
}
