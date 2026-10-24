import assert from "node:assert/strict";
import { FutureRosterPriceService } from "./FutureRosterPriceService.js";
import { RosterPricingCoordinator } from "./RosterPricingCoordinator.js";
import { createRosterPriceFixture } from "./roster-prices-test-fixture.js";

const fixture = await createRosterPriceFixture();
try {
  for (const month of ["past", "current", "next", "closed"]) await fixture.rosterRepository.saveRoster(1, month, fixture.slots);
  await fixture.rosterRepository.saveRoster(2, "next", fixture.slots.map((slot) => ({ ...slot, lockedPrice: 10 })));
  const before = await fixture.rosterRepository.listRosters(); let revisions = 0;
  const service = new FutureRosterPriceService({ ...fixture, revision: { async invalidateReports() { revisions++; } } });
  const updated = await service.reconcileOpenRosters(fixture.calendar);
  assert.equal(updated.length, 2); assert.equal(revisions, 1);
  for (const month of ["past", "current", "closed"]) assert.deepEqual(await fixture.rosterRepository.findRosterByUserAndMonth(1, month), before.find((roster) => roster.month === month));
  assert.equal((await fixture.rosterRepository.findRosterByUserAndMonth(1, "next")).status, "editing");
  assert.equal((await service.reconcileOpenRosters(fixture.calendar)).length, 0);
  fixture.players[0].price = 5;
  await service.reconcileOpenRosters(fixture.calendar);
  assert.equal((await fixture.rosterRepository.findRosterByUserAndMonth(1, "next")).status, "editing");
  const order = []; const coordinator = new RosterPricingCoordinator();
  await Promise.all([coordinator.runExclusive(async () => { order.push(1); await new Promise((resolve) => setTimeout(resolve, 20)); await new RosterPricingCoordinator().runExclusive(() => order.push(2)); }),
    new RosterPricingCoordinator().runExclusive(() => order.push(3))]);
  assert.deepEqual(order, [1, 2, 3]);
} finally { await fixture.close(); }
console.log("Roster repricing only open future tour, idempotence, recovery and serialized mutations self-test passed");
