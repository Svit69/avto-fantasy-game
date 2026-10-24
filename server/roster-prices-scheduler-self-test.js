import assert from "node:assert/strict";
import { RosterPriceNotificationScheduler } from "./RosterPriceNotificationScheduler.js";
import { InitialTourSelectionService } from "../src/services/InitialTourSelectionService.js";
import { TourSchedulePolicy } from "../src/services/TourSchedulePolicy.js";
import { createRosterPriceFixture } from "./roster-prices-test-fixture.js";

const fixture = await createRosterPriceFixture(); const previousWindow = globalThis.window;
try {
  let runs = 0; let acquired = false;
  const scheduler = new RosterPriceNotificationScheduler({ rootDirectory: fixture.directory, botClient: { hasToken() { return true; } }, logger: { info() {}, warn() {} },
    lock: { async acquireLock() { if (acquired) return false; acquired = true; return true; }, async releaseLock() { acquired = false; } },
    createWorker: () => ({ async processDueNotifications() { runs++; await new Promise((resolve) => setTimeout(resolve, 10)); return { sent: 1 }; } }) });
  const results = await Promise.all([scheduler.runOnce(), scheduler.runOnce()]);
  assert.equal(runs, 1); assert.equal(results[1].skipped, true); assert.equal(acquired, false);
  scheduler.start(); scheduler.stop();
  globalThis.window = { location: { search: "?roster_month=next" } };
  const calendar = { tours: fixture.calendar.tours.map((tour) => ({ ...tour, endsAt: new Date(fixture.now + (tour.month === "past" ? -1 : 1) * 86400000).toISOString() })) };
  const selector = new InitialTourSelectionService({ async loadFantasyCalendar() { return calendar; } },
    { async loadSavedRoster() { return { slots: fixture.slots }; } }, new TourSchedulePolicy());
  const select = { value: "current", options: [{ value: "current" }, { value: "next" }] };
  await selector.applyInitialTourSelection(select); assert.equal(select.value, "next");
  globalThis.window.location.search = "?roster_month=closed";
  await selector.applyInitialTourSelection(select); assert.equal(select.value, "current");
} finally { if (previousWindow === undefined) delete globalThis.window; else globalThis.window = previousWindow; await fixture.close(); }
console.log("Roster automatic scheduler, overlap protection and app deep-link tour selection self-test passed");
