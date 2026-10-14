import assert from "node:assert/strict";
import { CapacityAwareApiRequest } from "../src/services/CapacityAwareApiRequest.js";

const originalFetch = globalThis.fetch;
const originalWindow = globalThis.window;
const originalStorage = globalThis.sessionStorage;
const requests = [];
globalThis.window = { Telegram: { WebApp: { initData: "signed-telegram-data" } } };
globalThis.sessionStorage = { getItem: () => null };
globalThis.fetch = function (url, options) {
  assert.equal(this, globalThis, "Browser fetch must retain its global receiver");
  requests.push({ url, options });
  return Promise.resolve(new Response('{"userId":"123"}', { status: 200 }));
};
try {
  const response = await new CapacityAwareApiRequest().fetchResponse("/api/telegram-auth", {
    method: "POST", body: "signed-telegram-data",
  });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).userId, "123");
  assert.equal(requests.length, 1);
  assert.equal(requests[0].options.body, "signed-telegram-data");
  assert.equal(requests[0].options.headers.get("x-telegram-init-data"), "signed-telegram-data");
  await new CapacityAwareApiRequest().fetchResponse("/api/telegram-auth?web_login=signed-token");
  assert.equal(requests.length, 2);
} finally {
  globalThis.fetch = originalFetch;
  if (originalWindow === undefined) delete globalThis.window; else globalThis.window = originalWindow;
  if (originalStorage === undefined) delete globalThis.sessionStorage; else globalThis.sessionStorage = originalStorage;
}
console.log("Browser fetch receiver regression self-test passed");
