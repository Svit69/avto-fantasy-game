import assert from "node:assert/strict";
import { ManagerMenuController } from "../src/controllers/ManagerMenuController.js";
import { TelegramManagerProfileService } from "../src/services/TelegramManagerProfileService.js";

let callback; let resolveProfile;
const root = { innerHTML: "", querySelector() { return null; } };
const app = { addEventListener(_type, listener) { callback = listener; }, querySelector() { return root; } };
const controller = new ManagerMenuController(app, () => "test", {
  loadCachedProfile() { return { managerName: "Cached manager" }; },
  loadManagerProfile() { return new Promise((resolve) => { resolveProfile = resolve; }); }
});
controller.connectManagerMenuActions();
const click = (attribute) => callback({ target: { closest(selector) { return selector === `[${attribute}]` ? {} : null; } } });
const pending = click("data-open-manager-menu");
assert.match(root.innerHTML, /Cached manager/);
await click("data-close-manager-menu"); resolveProfile({ managerName: "Late", monthlyPlace: 1 }); await pending;
assert.equal(root.innerHTML, "");
const previousWindow = globalThis.window; globalThis.window = { Telegram: { WebApp: { initData: "available" } } };
try {
  let authCalls = 0; let summary;
  const service = new TelegramManagerProfileService({ loadProfile() { return { userId: "1", managerName: "Cached" }; } }, {},
    { async loadMonthlyStandings(_month, isSummary) { summary = isSummary; return { currentUser: { place: 7 } }; } });
  service.authorizationService = { async verifyAuthorization() { authCalls++; throw new Error("should_not_reauthorize"); } };
  assert.equal((await service.loadManagerProfile("test")).monthlyPlace, 7);
  assert.equal(authCalls, 0); assert.equal(summary, true);
} finally { if (previousWindow === undefined) delete globalThis.window; else globalThis.window = previousWindow; }
console.log("Performance immediate menu, cancellation and cached identity self-test passed");
