import assert from "node:assert/strict";
import { CALENDAR_MATCHES } from "../src/data/calendarSeed.js";
import { VHL_NOVEMBER_PROTOCOL_FIXTURE } from "./vhl-november-protocol-fixture.js";
import { VhlMatchIdentityGuard } from "./VhlMatchIdentityGuard.js";
import { VhlOnlineActiveMatchSelector } from "./VhlOnlineActiveMatchSelector.js";
import { CalendarRecordMerger } from "./CalendarRecordMerger.js";

const guard = new VhlMatchIdentityGuard(); const merger = new CalendarRecordMerger();
const ids = new Set();
for (const [onlineProtocolId, date, homeTeam, awayTeam, time] of VHL_NOVEMBER_PROTOCOL_FIXTURE) {
  const candidates = CALENDAR_MATCHES.filter((match) => match.onlineProtocolId === onlineProtocolId);
  assert.equal(candidates.length, 1); assert.equal(ids.has(onlineProtocolId), false); ids.add(onlineProtocolId);
  const [match] = candidates;
  assert.equal(match.league, "ВХЛ"); assert.equal(match.featuredTeam, "Горняк-УГМК");
  guard.validate({ homeTeam, awayTeam, scheduledAt: `${date}T${time}:00+03:00` }, match);
  assert.equal(match.startsAt, `${date}T${time}:00+03:00`);
  const stored = { ...match, status: "upcoming", customField: "preserve" }; delete stored.onlineProtocolId;
  const [backfilled] = merger.mergeSeedAndStoredRecords([match], [stored]);
  assert.equal(backfilled.onlineProtocolId, onlineProtocolId); assert.equal(backfilled.customField, "preserve");
  const polled = new VhlOnlineActiveMatchSelector().findActiveMatches({ matches: [backfilled] }, Date.parse(match.startsAt));
  assert.equal(polled[0].onlineGameId, onlineProtocolId);
}
console.log("VHL November nine ID assignments, calendar identities, validated times and stored-record backfill self-test passed");
