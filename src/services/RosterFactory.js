import { RosterSlot } from "../models/RosterSlot.js";
import { TeamRoster } from "../models/TeamRoster.js";

export class RosterFactory {
  createDefaultRoster(players) {
    const slots = [
      new RosterSlot("нападающий", players[0]),
      new RosterSlot("нападающий"),
      new RosterSlot("нападающий", players[1]),
      new RosterSlot("защитник", players[2]),
      new RosterSlot("защитник"),
      new RosterSlot("вратарь", players[4]),
    ];

    return new TeamRoster(100, slots);
  }
}
