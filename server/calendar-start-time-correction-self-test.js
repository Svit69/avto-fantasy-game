import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { CALENDAR_MATCHES } from "../src/data/calendarSeed.js";
import { CalendarRecordMerger } from "./CalendarRecordMerger.js";
import { FantasyCalendarRepository } from "./FantasyCalendarRepository.js";
import { PostgresCalendarRepository } from "./PostgresCalendarRepository.js";
import { VhlOnlineActiveMatchSelector } from "./VhlOnlineActiveMatchSelector.js";

for (const [id, previousStartsAt, startsAt] of [
  ["match-2027-01-29-gornyak-dynamo-altai", "2027-01-29T13:00:00+03:00", "2027-01-29T15:00:00+03:00"],
  ["match-2026-11-23-gornyak-kristall", "2026-11-23T17:30:00+03:00", "2026-11-23T16:30:00+03:00"]
]) {
  const seed = CALENDAR_MATCHES.find((match) => match.id === id);
  assert.equal(seed.startsAt, startsAt);
  const stored = { ...seed, startsAt: previousStartsAt, onlineProtocolId: "999999", customField: "preserve" };
  const merger = new CalendarRecordMerger();
  const [corrected] = merger.mergeSeedAndStoredRecords([seed], [stored]);
  assert.equal(corrected.startsAt, seed.startsAt); assert.equal(corrected.onlineProtocolId, "999999");
  assert.equal(corrected.customField, "preserve"); assert.equal(stored.startsAt, previousStartsAt);
  assert.deepEqual(merger.mergeSeedAndStoredRecords([seed], [corrected]), [corrected]);
  for (const changed of [{ startsAt: `${startsAt.slice(0, 10)}T20:00:00+03:00` }, { homeTeam: "Другой клуб" },
    { awayTeam: "Другой клуб" }, { league: "МХЛ" }, { featuredTeam: "Другой клуб" }]) {
    const current = { ...stored, ...changed };
    assert.deepEqual(merger.mergeSeedAndStoredRecords([seed], [current]), [current]);
  }
  const selector = new VhlOnlineActiveMatchSelector();
  assert.equal(selector.findActiveMatches({ matches: [corrected] }, Date.parse(seed.startsAt) - 1).length, 0);
  assert.equal(selector.findActiveMatches({ matches: [corrected] }, Date.parse(seed.startsAt)).length, 1);
  const postgres = new PostgresCalendarRepository({}, [], [seed]);
  postgres.tours = { listRecords: async () => [] }; postgres.matches = { listRecords: async () => [stored] };
  assert.deepEqual((await postgres.listCalendar()).matches, [corrected]);
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "calendar-time-"));
  try {
    const filePath = path.join(directory, "calendar.json");
    await fs.writeFile(filePath, JSON.stringify({ tours: [], matches: [stored] }), "utf8");
    const repository = new FantasyCalendarRepository(filePath, [], [seed]);
    assert.deepEqual(await repository.listMatches(), [corrected]);
    assert.deepEqual(JSON.parse(await fs.readFile(filePath, "utf8")).matches, [corrected]);
  } finally { await fs.rm(directory, { recursive: true, force: true }); }
}
console.log("Calendar November 23 and January 29 time corrections, JSON/PostgreSQL upgrade and poll start self-test passed");
