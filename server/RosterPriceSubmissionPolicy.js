import { FANTASY_ROSTER_RULES } from "../src/config/FantasyRosterRules.js";

export class RosterPriceSubmissionPolicy {
  validatePrices(slots, requested) {
    if (slots.some((slot) => slot.playerId && (!Number.isFinite(slot.lockedPrice) || slot.lockedPrice < 0))) {
      throw Object.assign(new Error("invalid_roster_player"), { statusCode: 400 });
    }
    const total = slots.reduce((sum, slot) => sum + Number(slot.lockedPrice || 0), 0);
    if (total > FANTASY_ROSTER_RULES.budgetLimit) throw Object.assign(new Error("roster_budget_exceeded"), { statusCode: 422 });
    if (slots.some((slot, index) => Number.isFinite(requested[index]?.lockedPrice) && requested[index].lockedPrice !== slot.lockedPrice)) {
      throw Object.assign(new Error("roster_prices_changed"), { statusCode: 409 });
    }
  }
}
