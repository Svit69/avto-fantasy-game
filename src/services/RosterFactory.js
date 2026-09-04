import { RosterSlot } from "../models/RosterSlot.js";
import { TeamRoster } from "../models/TeamRoster.js";
import { RosterLifecycle, ROSTER_MODES } from "../models/RosterLifecycle.js";
import { RosterPlayerPriceOverride } from "../models/RosterPlayerPriceOverride.js";

export class RosterFactory {
  createDefaultRoster(players) {
    return this.createEmptyRoster();
  }

  createEmptyRoster(mode = ROSTER_MODES.draft) {
    const positions = ["нападающий", "нападающий", "нападающий", "защитник", "защитник", "вратарь"];
    const slots = positions.map((position, index) => new RosterSlot(position, null, index));
    return new TeamRoster(80, slots, new RosterLifecycle(mode));
  }

  createRosterFromSavedRoster(players, savedRoster, mode = ROSTER_MODES.confirmed) {
    if (!savedRoster?.slots?.length) return mode === ROSTER_MODES.locked ? this.createEmptyRoster(mode) : this.createDefaultRoster(players);
    const slots = savedRoster.slots.map((slot) => new RosterSlot(
      slot.position, this.#findSavedPlayer(players, slot), slot.slotIndex,
    ));
    return new TeamRoster(80, slots, new RosterLifecycle(mode));
  }

  #findSavedPlayer(players, slot) {
    const player = players.find((candidate) => candidate.getId() === slot.playerId);
    if (!player || !Number.isFinite(slot.lockedPrice)) return player;
    return new RosterPlayerPriceOverride(player, slot.lockedPrice);
  }
}
