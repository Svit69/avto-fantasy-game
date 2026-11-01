import assert from "node:assert/strict";
import { CALENDAR_MATCHES } from "../src/data/calendarSeed.js";
import { VHL_DECEMBER_PROTOCOL_FIXTURE } from "./vhl-december-protocol-fixture.js";
import { VhlMatchIdentityGuard } from "./VhlMatchIdentityGuard.js";
import { VhlOnlineActiveMatchSelector } from "./VhlOnlineActiveMatchSelector.js";
import { CalendarRecordMerger } from "./CalendarRecordMerger.js";

const guard = new VhlMatchIdentityGuard(); const merger = new CalendarRecordMerger(); const ids = new Set();
for (const [onlineProtocolId, date, homeTeam, awayTeam, time] of VHL_DECEMBER_PROTOCOL_FIXTURE) {
  const candidates = CALENDAR_MATCHES.filter((match) => match.onlineProtocolId === onlineProtocolId);
  assert.equal(candidates.length, 1); assert.equal(ids.has(onlineProtocolId), false); ids.add(onlineProtocolId);
  const [match] = candidates;
  assert.equal(match.league, "ВХЛ"); assert.equal(match.featuredTeam, "Горняк-УГМК");
  guard.validate({ homeTeam, awayTeam, scheduledAt: `${date}T${time}:00+03:00` }, match);
  assert.equal(match.startsAt, `${date}T${time}:00+03:00`);
  const stored = { ...match, customField: "preserve" }; delete stored.onlineProtocolId;
  const [backfilled] = merger.mergeSeedAndStoredRecords([match], [stored]);
  assert.equal(backfilled.onlineProtocolId, onlineProtocolId); assert.equal(backfilled.customField, "preserve");
  const [polled] = new VhlOnlineActiveMatchSelector().findActiveMatches({ matches: [backfilled] }, Date.parse(match.startsAt));
  assert.equal(polled.onlineGameId, onlineProtocolId);
}
const match = CALENDAR_MATCHES.find((item) => item.onlineProtocolId === "904493");
for (const awayTeam of ["Динамо СПб", "ДИНАМО СПБ", "ХК «Динамо СПб»"]) {
  guard.validate({ homeTeam: match.homeTeam, awayTeam, scheduledAt: match.startsAt }, match);
}
for (const awayTeam of ["Динамо Москва", "Динамо СПб-2", "Динамо Минск"]) {
  assert.throws(() => guard.validate({ homeTeam: match.homeTeam, awayTeam, scheduledAt: match.startsAt }, match), /identity_mismatch/);
}
assert.throws(() => guard.validate({ homeTeam: match.homeTeam, awayTeam: "Динамо СПб", scheduledAt: "2026-12-22T16:30:00+03:00" }, match), /identity_mismatch/);
console.log("VHL December nine ID assignments, exact times, safe backfill and Dynamo SPb alias self-test passed");
