import assert from "node:assert/strict";
import { RosterController } from "./RosterController.js";

const slots = [{ playerId: "player", lockedPrice: 10 }]; let writes = 0; const responses = [];
const deadlineGuard = { canModifyRoster: async () => true, findRosterAccessState: async () => ({ isOpen: true, isLocked: true }) };
const repository = { saveRoster: () => { throw Error("unbounded_save_must_not_be_used"); },
  saveRosterBeforeDeadline: async (userId, month, selected, deadline) => { writes++; assert.ok(Number.isFinite(deadline)); return null; } };
const controller = new RosterController({ deadlineGuard, rosterRepository: repository,
  bodyParser: { readJson: async () => ({ month: "next", slots }) }, profileResolver: { resolveProfile: async () => ({ id: 1 }) },
  priceLocker: { lockRosterSlotPrices: async () => slots }, jsonResponder: { sendJson: (response, status, body) => responses.push({ status, body }) } });
await controller.handleRequest({ method: "POST" }, {});
assert.equal(responses.at(-1).status, 423); assert.equal(writes, 0);
deadlineGuard.findRosterAccessState = async () => ({ isOpen: true, isLocked: false, deadlineTime: Date.now() + 1000 });
await controller.handleRequest({ method: "POST" }, {});
assert.equal(responses.at(-1).status, 423); assert.equal(responses.at(-1).body.error, "tour_started"); assert.equal(writes, 1);
console.log("Roster deadline recheck after pricing and commit-time deadline rejection self-test passed");
