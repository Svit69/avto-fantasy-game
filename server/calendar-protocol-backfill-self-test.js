import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { CALENDAR_MATCHES } from "../src/data/calendarSeed.js";
import { CalendarRecordMerger } from "./CalendarRecordMerger.js";
import { FantasyCalendarRepository } from "./FantasyCalendarRepository.js";
import { PostgresCalendarRepository } from "./PostgresCalendarRepository.js";

const seed = CALENDAR_MATCHES.find((match) => match.onlineProtocolId === "904295");
const stored = { ...seed, customField: "keep" }; delete stored.onlineProtocolId;
const merger = new CalendarRecordMerger();
for (const changed of [{ onlineProtocolId: "999999" }, { homeTeam: "Другой клуб" }, { awayTeam: "Другой клуб" },
  { featuredTeam: "Другой клуб" }, { league: "МХЛ" }, { startsAt: "2026-11-07T16:00:00+03:00" }]) {
  const current = { ...stored, ...changed };
  assert.deepEqual(merger.mergeSeedAndStoredRecords([seed], [current]), [current]);
}
assert.deepEqual(merger.mergeSeedAndStoredRecords([{ id: "tour" }], [{ id: "tour", custom: 1 }]), [{ id: "tour", custom: 1 }]);
assert.equal(merger.mergeSeedAndStoredRecords([seed], [stored, { id: "custom" }])[1].id, "custom");
const postgres = new PostgresCalendarRepository({}, [], [seed]);
postgres.tours = { listRecords: async () => [] }; postgres.matches = { listRecords: async () => [stored] };
assert.equal((await postgres.listCalendar()).matches[0].onlineProtocolId, seed.onlineProtocolId);
const directory = await fs.mkdtemp(path.join(os.tmpdir(), "vhl-calendar-"));
try {
  const filePath = path.join(directory, "calendar.json");
  await fs.writeFile(filePath, JSON.stringify({ tours: [], matches: [stored] }), "utf8");
  const repository = new FantasyCalendarRepository(filePath, [], [seed]);
  const [match] = await repository.listMatches();
  assert.equal(match.onlineProtocolId, seed.onlineProtocolId); assert.equal(match.customField, "keep");
  assert.equal(JSON.parse(await fs.readFile(filePath, "utf8")).matches[0].onlineProtocolId, seed.onlineProtocolId);
} finally { await fs.rm(directory, { recursive: true, force: true }); }
console.log("Calendar JSON/PostgreSQL safe missing-ID backfill, admin overrides and changed-match isolation self-test passed");
