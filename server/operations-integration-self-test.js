import assert from "node:assert/strict";
import http from "node:http";
import { once } from "node:events";
import { ServerApplicationFactory } from "./ServerApplicationFactory.js";
import { TelegramWebhookInstaller } from "./TelegramWebhookInstaller.js";
import { createOperationsTestWorkspace } from "./operations-test-workspace.js";

const workspace = await createOperationsTestWorkspace();
const keys = ["STORAGE_DRIVER", "TELEGRAM_BOT_TOKEN", "OPERATIONS_MONITOR_TOKEN", "TELEGRAM_WEBHOOK_SECRET", "RUNTIME_STATE_DIRECTORY"];
const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
Object.assign(process.env, { STORAGE_DRIVER: "json", TELEGRAM_BOT_TOKEN: "fake-token", OPERATIONS_MONITOR_TOKEN: "ops-test", TELEGRAM_WEBHOOK_SECRET: "hook-test", RUNTIME_STATE_DIRECTORY: workspace.directory });
const application = new ServerApplicationFactory(workspace.directory, { info: () => {}, warn: () => {}, error: () => {} }).createApplication();
const server = http.createServer((request, response) => application.handleRequest(request, response));
server.listen(0, "127.0.0.1"); await once(server, "listening");
try {
  const origin = `http://127.0.0.1:${server.address().port}`;
  assert((await (await fetch(`${origin}/api/health`)).json()).ok);
  assert((await (await fetch(`${origin}/api/ready`)).json()).ok);
  assert.equal((await fetch(`${origin}/api/operations`)).status, 403);
  assert.equal((await fetch(`${origin}/api/telegram-bot-info`)).status, 403);
  assert.equal((await fetch(`${origin}/api/telegram-webhook-info`)).status, 403);
  assert.equal((await fetch(`${origin}/api/operations`, { headers: { authorization: "Bearer ops-test" } })).status, 200);
  assert.equal((await fetch(`${origin}/api/telegram-webhook`, { method: "POST", body: "{}" })).status, 403);
  assert.equal((await fetch(`${origin}/api/telegram-webhook`, { method: "POST", headers: { "x-telegram-bot-api-secret-token": "hook-test" }, body: "{}" })).status, 400);
  assert.equal((await fetch(`${origin}/api/telegram-set-webhook`, { method: "POST" })).status, 403);
  assert.equal((await fetch(`${origin}/api/telegram-auth`, { method: "POST", body: "a".repeat(70000) })).status, 413);
  let payload;
  const installer = new TelegramWebhookInstaller({ jsonResponder: { sendJson: (_response, status) => status }, webhookUrl: "https://example.test/hook", logger: { info: () => {} },
    botClient: { hasToken: () => true, callMethod: async (_method, value) => { payload = value; return new Response("{}", { status: 200 }); } } });
  await installer.handleRequest({ method: "POST", headers: { authorization: "Bearer ops-test" } }, {});
  assert.equal(payload.drop_pending_updates, false); assert.equal(payload.secret_token, "hook-test"); assert.equal(payload.max_connections, 4);
} finally {
  server.closeAllConnections(); await new Promise((resolve) => server.close(resolve));
  for (const key of keys) if (previous[key] === undefined) delete process.env[key]; else process.env[key] = previous[key];
  await workspace.close();
}
console.log("Operations application integration and webhook security self-test passed");
