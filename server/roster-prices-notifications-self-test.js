import assert from "node:assert/strict";
import path from "node:path";
import { RosterPriceNotificationPlanner } from "./RosterPriceNotificationPlanner.js";
import { NotificationSentRepository } from "./NotificationSentRepository.js";
import { DraftNotificationDispatcher } from "./DraftNotificationDispatcher.js";
import { createRosterPriceFixture } from "./roster-prices-test-fixture.js";

const fixture = await createRosterPriceFixture();
try {
  await fixture.rosterRepository.saveRoster(1, "next", fixture.slots);
  await fixture.rosterRepository.saveRoster(2, "next", fixture.slots);
  const planner = new RosterPriceNotificationPlanner(fixture);
  const users = [{ id: "1", status: "active" }, { id: "2", status: "blocked" }];
  const jobs = await planner.createNotificationJobs(fixture.calendar, users);
  assert.equal(jobs.length, 1); assert.equal(jobs[0].userId, "1");
  assert.match(jobs[0].text, /95к/); assert.match(jobs[0].text, /90к/);
  assert.equal(new URL(jobs[0].replyMarkup.inline_keyboard[0][0].web_app.url).searchParams.get("roster_month"), "next");
  assert.equal((await planner.createNotificationJobs(fixture.calendar, users))[0].key, jobs[0].key);
  let successful = false; let sends = 0;
  const bot = { async callMethod() { sends++; return { ok: true, async json() { return { ok: successful }; } }; } };
  const sentPath = path.join(fixture.directory, "sent.json"); const logger = { info() {}, warn() {} };
  const dispatch = () => new DraftNotificationDispatcher(bot, new NotificationSentRepository(sentPath), logger, { async waitForNextDeliverySlot() {} });
  assert.equal((await dispatch().dispatchNotificationJobs(jobs)).failed, 1);
  successful = true;
  assert.equal((await dispatch().dispatchNotificationJobs(jobs)).sent, 1);
  assert.equal((await dispatch().dispatchNotificationJobs(jobs)).skipped, 1); assert.equal(sends, 2);
  fixture.players[0].price = 25;
  const pending = await planner.createNotificationJobs(fixture.calendar, users);
  assert.notEqual(pending[0].key, jobs[0].key);
  await fixture.rosterRepository.saveRoster(1, "next", fixture.slots);
  assert.equal((await dispatch().dispatchNotificationJobs(pending)).skipped, 1);
  const expired = { tours: fixture.calendar.tours.filter((tour) => tour.month !== "closed").map((tour) => ({ ...tour, deadlineAt: new Date(Date.now() - 1000).toISOString() })) };
  assert.deepEqual(await planner.createNotificationJobs(expired, users), []);
} finally { await fixture.close(); }
console.log("Roster price messages, app month, blocked users, retries, persisted deduplication and stale job cancellation self-test passed");
