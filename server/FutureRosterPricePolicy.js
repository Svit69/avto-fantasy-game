import crypto from "node:crypto";
import { FANTASY_ROSTER_RULES } from "../src/config/FantasyRosterRules.js";

export class FutureRosterPricePolicy {
  repriceRoster(roster, players, now = Date.now()) {
    const changes = [];
    const slots = (roster.slots || []).map((slot) => {
      const player = players.get(slot.playerId);
      if (!player || !Number.isFinite(player.price) || player.price < 0) return slot;
      if (slot.lockedPrice !== player.price) changes.push({ playerId: player.id, name: `${player.firstName || ""} ${player.lastName || ""}`.trim(), before: slot.lockedPrice ?? player.price, after: player.price });
      return { ...slot, lockedPrice: player.price };
    });
    if (!changes.length) return null;
    const total = slots.reduce((sum, slot) => sum + Number(slot.lockedPrice || 0), 0);
    const budget = FANTASY_ROSTER_RULES.budgetLimit;
    const combined = new Map((roster.priceAdjustment?.changes || []).map((change) => [change.playerId, change]));
    for (const change of changes) combined.set(change.playerId, { ...change, before: combined.get(change.playerId)?.before ?? change.before });
    return { ...roster, slots, status: total > budget ? "editing" : roster.status,
      priceAdjustment: { id: crypto.randomUUID(), total, budget, changedAt: new Date(now).toISOString(),
        changes: [...combined.values()].filter((change) => change.before !== change.after) } };
  }
}
