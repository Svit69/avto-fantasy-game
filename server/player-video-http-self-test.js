import assert from "node:assert/strict";
import http from "node:http";
import path from "node:path";
import fs from "node:fs/promises";
import { once } from "node:events";
import { ServerApplicationFactory } from "./ServerApplicationFactory.js";
import { StorageDriverFactory } from "./StorageDriverFactory.js";
import { INITIAL_PLAYERS } from "../src/data/players.js";
import { createOperationsTestWorkspace } from "./operations-test-workspace.js";
const workspace = await createOperationsTestWorkspace();
const keys = ["STORAGE_DRIVER", "TELEGRAM_BOT_TOKEN", "TELEGRAM_ADMIN_IDS", "TELEGRAM_WEBHOOK_SECRET", "RUNTIME_STATE_DIRECTORY"];
const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
Object.assign(process.env, { STORAGE_DRIVER: "json", TELEGRAM_BOT_TOKEN: "fake-video-test", TELEGRAM_ADMIN_IDS: "1", TELEGRAM_WEBHOOK_SECRET: "test-secret", RUNTIME_STATE_DIRECTORY: workspace.directory });
const application = new ServerApplicationFactory(workspace.directory, { info: () => {}, warn: () => {}, error: () => {} }).createApplication();
application.application.webhookController.botClient.callMethod = async () => new Response('{"ok":true}');
const server = http.createServer((request, response) => application.handleRequest(request, response));
server.listen(0, "127.0.0.1"); await once(server, "listening");
try {
  let sequence = 1000;
  const post = async (update) => {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/telegram-webhook`, { method: "POST",
      headers: { "x-telegram-bot-api-secret-token": "test-secret" }, body: JSON.stringify({ update_id: sequence++, ...update }) });
    assert.equal(response.status, 200); return response.json();
  };
  const callback = (data, id = 1) => post({ callback_query: { id: "callback", data, from: { id }, message: { chat: { id } } } });
  const teams = await callback("admin:players:0"); assert(teams.text.includes("Команда"));
  const positions = await callback(teams.reply_markup.inline_keyboard[0][0].callback_data); assert(positions.text.includes("Позиция"));
  const listing = await callback(positions.reply_markup.inline_keyboard[0][0].callback_data); assert(listing.text.includes("Хоккеисты"));
  const playerId = INITIAL_PLAYERS[0].id;
  assert((await callback(`admin:video_upload:${playerId}`)).text.includes("следующим сообщением"));
  const saved = await post({ message: { chat: { id: 1 }, from: { id: 1 }, video_note: { file_id: "e2e-file", file_unique_id: "e2e-unique", duration: 15, length: 240 } } });
  assert(saved.text.includes("сохранён"));
  assert.equal((await callback(`admin:video_player:${playerId}`)).video_note, "e2e-file");
  assert((await callback("admin:video_list:0")).text.includes("Кружки хоккеистов: 1"));
  const storage = new StorageDriverFactory((file) => path.join(workspace.directory, file));
  await storage.createRosterRepository().saveRoster(1, "Ноябрь", INITIAL_PLAYERS.slice(0, 6).map((player) => ({ playerId: player.id })));
  assert.equal((await callback("admin:video_test_tour:2026-11-tour-1")).video_note, "e2e-file");
  assert(!(await fs.readdir(workspace.directory)).some((name) => name.startsWith("video-delivery-")), "Admin tests must not consume actual delivery receipts");
  assert((await callback("admin:video_list:0", 99)).text.includes("Нет доступа"));
} finally {
  server.closeAllConnections(); await new Promise((resolve) => server.close(resolve));
  for (const key of keys) if (previous[key] === undefined) delete process.env[key]; else process.env[key] = previous[key];
  await workspace.close();
}
console.log("Player video real HTTP webhook upload, directory and admin test self-test passed");
