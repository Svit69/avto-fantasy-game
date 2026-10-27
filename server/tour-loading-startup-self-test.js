import assert from "node:assert/strict";
import { ApplicationStartupController } from "../src/controllers/ApplicationStartupController.js";
import { RosterConfirmationCoordinator } from "../src/services/RosterConfirmationCoordinator.js";
import { RosterFactory } from "../src/services/RosterFactory.js";

const calls = []; const shell = { renderApplicationShell() { calls.push("shell"); }, completeLoading() { calls.push("complete"); }, failLoading() { calls.push("failed"); } };
await new ApplicationStartupController({}, shell).initialize(async () => { throw new Error("offline"); });
assert.deepEqual(calls, ["shell", "failed"]);
calls.length = 0; await new ApplicationStartupController({}, shell).initialize(async () => {});
assert.deepEqual(calls, ["shell", "complete"]);
const factory = new RosterFactory(); const teamRoster = factory.createEmptyRoster("editing");
let month = "next"; let resolveSave; let rendered = 0;
const coordinator = new RosterConfirmationCoordinator({ teamRoster, getSelectedMonth: () => month,
  rosterSubmissionApiClient: { submitConfirmedRoster() { return new Promise((resolve) => { resolveSave = resolve; }); } },
  afterRosterSubmit: async () => {}, rosterDomRenderer: { renderRosterSections() { rendered++; } } });
const save = coordinator.confirm(); month = "closed"; teamRoster.replaceRosterState(factory.createEmptyRoster("locked"));
resolveSave(); await save; assert.equal(rendered, 0); assert.equal(teamRoster.isLocked(), true);
month = "next"; teamRoster.replaceRosterState(factory.createEmptyRoster("editing"));
const roundTrip = coordinator.confirm(); teamRoster.replaceRosterState(factory.createEmptyRoster("editing"));
resolveSave(); await roundTrip; assert.equal(rendered, 0); assert.equal(teamRoster.isConfirmed(), false);
console.log("Tour startup failure blocking and late save isolation across month changes self-test passed");
