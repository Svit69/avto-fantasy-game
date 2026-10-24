import assert from "node:assert/strict";
import { FutureRosterPricePolicy } from "./FutureRosterPricePolicy.js";
import { RosterPriceSubmissionPolicy } from "./RosterPriceSubmissionPolicy.js";
import { RosterSlotPriceLocker } from "./RosterSlotPriceLocker.js";
import { TourDeadlinePolicy } from "../src/services/TourDeadlinePolicy.js";
import { RosterCompletionPolicy } from "./RosterCompletionPolicy.js";
import { StandingsCalculator } from "./StandingsCalculator.js";
import { createRosterPriceFixture } from "./roster-prices-test-fixture.js";

const fixture = await createRosterPriceFixture();
try {
  const roster = { userId: "1", month: "next", status: "confirmed", slots: fixture.slots };
  const players = new Map(fixture.players.map((player) => [player.id, player]));
  const policy = new FutureRosterPricePolicy(); const updated = policy.repriceRoster(roster, players);
  assert.equal(updated.status, "editing"); assert.equal(updated.priceAdjustment.total, 95);
  assert.equal(updated.slots.length, 6); assert.equal(updated.slots[0].lockedPrice, 20);
  assert.equal(policy.repriceRoster(updated, players), null);
  players.set("p0", { ...fixture.players[0], price: 10 });
  const cheaper = policy.repriceRoster(roster, players);
  assert.equal(cheaper.status, "confirmed"); assert.equal(cheaper.priceAdjustment.total, 85);
  assert.equal(policy.repriceRoster(updated, players).status, "editing");
  const slots = await new RosterSlotPriceLocker(fixture.playerCatalogRepository).lockRosterSlotPrices(fixture.slots, roster);
  assert.equal(slots[0].lockedPrice, 20);
  const validator = new RosterPriceSubmissionPolicy();
  assert.throws(() => validator.validatePrices(slots, fixture.slots), { statusCode: 422 });
  assert.throws(() => validator.validatePrices([{ ...slots[0], lockedPrice: 16 }], [fixture.slots[0]]), { statusCode: 409 });
  assert.throws(() => validator.validatePrices([{ playerId: "unknown", lockedPrice: null }], []), { statusCode: 400 });
  validator.validatePrices([{ lockedPrice: 90 }], []);
  assert.equal(new TourDeadlinePolicy().resolveRosterMode(updated, fixture.calendar, "next"), "editing");
  assert.equal(new TourDeadlinePolicy().resolveRosterMode(updated, fixture.calendar, "current"), "locked");
  assert.equal(new RosterCompletionPolicy().isRosterConfirmed(updated), false);
  const standings = new StandingsCalculator().createMonthlyStandings([updated], [{ id: "1" }], new Map(), "next", "1");
  assert.equal(standings.entries.length, 0);
} finally { await fixture.close(); }
console.log("Roster price policy, latest submission prices, budget and editing state self-test passed");
