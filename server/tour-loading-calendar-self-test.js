import assert from "node:assert/strict";
import { FantasyCalendarApiClient } from "../src/services/FantasyCalendarApiClient.js";
import { RosterSubmissionApiClient } from "../src/services/RosterSubmissionApiClient.js";
import { createTourLoadingFixture } from "./tour-loading-test-fixture.js";

const { calendar } = createTourLoadingFixture(); const original = globalThis.fetch;
try {
  FantasyCalendarApiClient.cache = null;
  globalThis.fetch = async () => new Response("{}", { status: 500 });
  const client = new FantasyCalendarApiClient();
  await assert.rejects(client.loadFantasyCalendar(), { message: "calendar_load_failed" });
  assert.equal(FantasyCalendarApiClient.cache, null);
  let requests = 0;
  globalThis.fetch = async () => { requests++; return Response.json(calendar); };
  const loaded = await Promise.all(Array.from({ length: 10 }, () => client.loadFantasyCalendar()));
  assert.equal(requests, 1); assert.deepEqual(loaded[0].tours, calendar.tours);
  assert.deepEqual(await new FantasyCalendarApiClient().loadFantasyCalendar(), loaded[0]);
  assert.equal(requests, 1);
  for (const payload of [{}, { tours: [], matches: null }, { ...calendar, tours: [{ id: "bad", month: "bad", deadlineAt: "invalid" }] }]) {
    FantasyCalendarApiClient.cache = null; globalThis.fetch = async () => Response.json(payload);
    await assert.rejects(client.loadFantasyCalendar(), /invalid_calendar/); assert.equal(FantasyCalendarApiClient.cache, null);
  }
  FantasyCalendarApiClient.cache = null; globalThis.fetch = async () => { throw new Error("offline"); };
  await assert.rejects(client.loadFantasyCalendar(), /offline/);
  const rosterClient = new RosterSubmissionApiClient({ createAuthorizationHeaders: () => ({}) });
  globalThis.fetch = async () => new Response("{}", { status: 500 });
  await assert.rejects(rosterClient.loadSavedRoster("next"), /roster_load_failed/);
  globalThis.fetch = async () => Response.json({ roster: null });
  assert.equal(await rosterClient.loadSavedRoster("next"), null);
  for (const payload of [{}, { roster: { month: "past", slots: [] } }]) {
    globalThis.fetch = async () => Response.json(payload);
    await assert.rejects(rosterClient.loadSavedRoster("next"), /invalid_roster_payload/);
  }
} finally { globalThis.fetch = original; FantasyCalendarApiClient.cache = null; }
console.log("Tour loading calendar cache collapse, HTTP failure recovery and explicit missing roster self-test passed");
