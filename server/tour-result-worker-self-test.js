import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { ServerNotificationFactory } from "./ServerNotificationFactory.js";
import { TourResultStateStore } from "./TourResultStateStore.js";
import { createOperationsTestWorkspace } from "./operations-test-workspace.js";
import { createTourResultTestScenario } from "./tour-result-test-scenario.js";
const workspace = await createOperationsTestWorkspace();
const configuration = { STORAGE_DRIVER: "json", TOUR_RESULTS_SETTLE_MS: "0", TOUR_RESULTS_NOTIFICATIONS_ENABLED: "true", TELEGRAM_ADMIN_IDS: "99", RUNTIME_STATE_DIRECTORY: workspace.directory,
  USER_DATABASE_PATH: "storage/users.json", ROSTER_DATABASE_PATH: "storage/rosters.json", PLAYER_DATABASE_PATH: "storage/players.json", KHL_DATABASE_PATH: "storage/khl-match-data.json", CALENDAR_DATABASE_PATH: "storage/calendar.json", NOTIFICATION_DATABASE_PATH: "storage/notifications.json" };
const previous = Object.fromEntries(Object.keys(configuration).map((key) => [key, process.env[key]]));
Object.assign(process.env, configuration);
try {
  const scenario = createTourResultTestScenario();
  const directory = path.join(workspace.directory, "storage"); await fs.mkdir(directory);
  const records = { "users.json": { users: scenario.users }, "rosters.json": { rosters: scenario.rosters }, "players.json": { players: scenario.players },
    "khl-match-data.json": scenario.database, "calendar.json": scenario.calendar };
  for (const [name, data] of Object.entries(records)) await fs.writeFile(path.join(directory, name), JSON.stringify(data));
  await new TourResultStateStore().readActivationTime(scenario.end - 1);
  const deliveries = [];
  const bot = { callMethod: async (_method, payload) => { deliveries.push(payload); return new Response('{"ok":true}'); } };
  const factory = () => new ServerNotificationFactory(workspace.directory, bot, { info: () => {}, warn: () => {} });
  const result = await factory().createTourResultNotificationWorker().processDueNotifications(scenario.end);
  assert.equal(result.sent, 3, "Two tied winners and one administrator must receive results");
  assert.deepEqual(deliveries.map((message) => String(message.chat_id)), ["1", "2", "99"]);
  assert(!deliveries[0].text.includes(scenario.users[0].phone));
  assert(deliveries[2].text.includes(scenario.users[0].phone));
  const repeated = await factory().createTourResultNotificationWorker().processDueNotifications(scenario.end + 1000);
  assert.equal(repeated.sent, 0); assert.equal(repeated.skipped, 3);
  assert.equal(deliveries.length, 3, "Recreated factory/worker must not repeat successful notifications");
} finally {
  for (const [key, value] of Object.entries(previous)) if (value === undefined) delete process.env[key]; else process.env[key] = value;
  await workspace.close();
}
console.log("Tour results full worker/factory targeting and restart deduplication self-test passed");
