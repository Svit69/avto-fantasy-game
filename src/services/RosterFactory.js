import { RosterSlot } from "../models/RosterSlot.js";
import { TeamRoster } from "../models/TeamRoster.js";
import { RosterLifecycle, ROSTER_MODES } from "../models/RosterLifecycle.js";
import { RosterPlayerPriceOverride } from "../models/RosterPlayerPriceOverride.js";

export class RosterFactory {
  createDefaultRoster(players) {
    const slots = [
      new RosterSlot("нападающий", this.#findPlayerByLastName(players, "Голышев"), 0),
      new RosterSlot("нападающий", null, 1),
      new RosterSlot("нападающий", this.#findPlayerByLastName(players, "Спронг"), 2),
      new RosterSlot("защитник", this.#findPlayerByLastName(players, "Трямкин"), 3),
      new RosterSlot("защитник", null, 4),
      new RosterSlot("вратарь", null, 5),
    ];

    return new TeamRoster(80, slots, new RosterLifecycle());
  }

  createRosterFromSavedRoster(players, savedRoster, mode = ROSTER_MODES.confirmed) {
    if (!savedRoster?.slots?.length) return this.createDefaultRoster(players);
    const slots = savedRoster.slots.map((slot) => new RosterSlot(
      slot.position, this.#findSavedPlayer(players, slot), slot.slotIndex,
    ));
    return new TeamRoster(80, slots, new RosterLifecycle(mode));
  }

  #findPlayerByLastName(players, lastName) {
    return players.find((player) => player.getLastName() === lastName);
  }

  #findSavedPlayer(players, slot) {
    const player = players.find((candidate) => candidate.getId() === slot.playerId);
    if (!player || !Number.isFinite(slot.lockedPrice)) return player;
    return new RosterPlayerPriceOverride(player, slot.lockedPrice);
  }
}
