import assert from "node:assert/strict";
import { AdminPlayerMutationService } from "./AdminPlayerMutationService.js";
import { FutureRosterPriceService } from "./FutureRosterPriceService.js";
import { ServerNotificationFactory } from "./ServerNotificationFactory.js";
import { createRosterPriceHttpFixture } from "./roster-prices-http-fixture.js";

const fixture = await createRosterPriceHttpFixture();
try {
  const repository = fixture.storage.createRosterRepository(); const catalog = fixture.storage.createPlayerCatalogRepository();
  const post = (slots, month = "next") => fetch(`${fixture.origin}/api/roster`, { method: "POST", headers: fixture.headers, body: JSON.stringify({ month, slots }) });
  assert.equal((await post(fixture.slots)).status, 422);
  assert.equal((await post(fixture.slots, "current")).status, 423);
  assert.equal((await fetch(`${fixture.origin}/api/roster`)).status, 401);
  await catalog.updatePlayerPrice("p0", 5);
  assert.equal((await post(fixture.slots)).status, 409);
  const valid = fixture.slots.map((slot, index) => ({ ...slot, lockedPrice: index ? 15 : 5 }));
  assert.equal((await post(valid)).status, 200);
  assert.equal((await repository.findRosterByUserAndMonth(1, "next")).status, "confirmed");
  const priceService = new FutureRosterPriceService({ rosterRepository: repository, playerCatalogRepository: catalog, calendarRepository: fixture.storage.createCalendarRepository() });
  const admin = new AdminPlayerMutationService({ playerCatalogRepository: catalog, rosterPriceService: priceService,
    view: { renderOperationResult() {}, renderInvalidCommand() { throw new Error("invalid"); } } });
  await admin.updatePlayerPrice(1, "p0", 20);
  const invalidated = await repository.findRosterByUserAndMonth(1, "next");
  assert.equal(invalidated.status, "editing"); assert.equal(invalidated.priceAdjustment.total, 95);
  let sends = 0;
  const bot = { async callMethod(method, payload) { sends++; assert.equal(method, "sendMessage"); assert.ok(payload.reply_markup); return { ok: true, async json() { return { ok: true }; } }; } };
  const worker = new ServerNotificationFactory(fixture.directory, bot, fixture.logger).createRosterPriceNotificationWorker();
  assert.equal((await worker.processDueNotifications()).sent, 1);
  assert.equal((await worker.processDueNotifications()).skipped, 1); assert.equal(sends, 1);
  const standings = await fetch(`${fixture.origin}/api/standings?month=next&limit=50`, { headers: fixture.headers });
  assert.equal((await standings.json()).standings.entries.length, 0);
  await admin.updatePlayerPrice(1, "p0", 5);
  assert.equal((await repository.findRosterByUserAndMonth(1, "next")).status, "editing");
  assert.equal((await post(valid)).status, 200);
  const restored = await repository.findRosterByUserAndMonth(1, "next");
  assert.equal(restored.status, "confirmed"); assert.equal(restored.priceAdjustment, undefined);
} finally { await fixture.close(); }
console.log("Roster real HTTP auth, latest-price rejection, admin repricing, automatic delivery and resubmission self-test passed");
