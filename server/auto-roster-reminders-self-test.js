import assert from "node:assert/strict";
import { DraftNotificationPlanner } from "./DraftNotificationPlanner.js";
import { DraftNotificationMessageFactory } from "./DraftNotificationMessageFactory.js";
import { DraftReminderNotificationScheduler } from "./DraftReminderNotificationScheduler.js";
import { createAutoRosterFixture } from "./auto-roster-test-fixture.js";

const fixture = await createAutoRosterFixture();
try {
  await fixture.service.fillRoster(1);
  const planner = new DraftNotificationPlanner(fixture.rosterRepository, new DraftNotificationMessageFactory());
  const jobs = await planner.createNotificationJobs(fixture.calendar, fixture.users, fixture.now);
  const reminders = jobs.filter((job) => job.key === "deadline:next:24:missing");
  assert.equal(reminders.length, 2);
  assert.ok(!reminders.some((job) => job.userId === "1" || job.userId === "3"));
  assert.equal(reminders[0].replyMarkup.inline_keyboard[0][0].callback_data, "roster_auto:next");
  assert.match(reminders[0].text, /Ранее выбранные игроки/);
  const hourly = await planner.createNotificationJobs(fixture.calendar, fixture.users, fixture.now + 23 * 3600000);
  const hourlyReminders = hourly.filter((job) => job.key.startsWith("deadline:next:1:"));
  assert.ok(hourlyReminders.length > 0);
  assert.ok(hourlyReminders.every((job) => !job.replyMarkup && !job.text.includes("Автозаполнение")));
  const afterDeadline = await planner.createNotificationJobs(fixture.calendar, fixture.users, fixture.now + 86400000);
  assert.ok(!afterDeadline.some((job) => job.key.startsWith("deadline:next:")));
  let runs = 0; let released = false;
  const scheduler = new DraftReminderNotificationScheduler({ rootDirectory: fixture.directory, botClient: { hasToken: () => true }, logger: { info() {}, warn() {} },
    lock: { async acquireLock() { return true; }, async releaseLock() { released = true; } }, createWorker: () => ({ async processDueNotifications() { runs++; return { sent: 1 }; } }) });
  await scheduler.runOnce(); scheduler.start(); scheduler.stop();
  assert.equal(runs, 1); assert.equal(released, true);
} finally { await fixture.close(); }
console.log("Autofill 24-hour reminders, saved and blocked exclusions, callback tour and scheduler self-test passed");
