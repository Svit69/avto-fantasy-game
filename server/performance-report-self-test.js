import assert from "node:assert/strict";
import { MonthlyStandingsReportService } from "./MonthlyStandingsReportService.js";
import { RevisionedReportCache } from "./RevisionedReportCache.js";
import { SyntheticLoadFixture } from "./SyntheticLoadFixture.js";

const data = new SyntheticLoadFixture().createData(120); let time = 0; let revision = 0; let reads = 0;
const cache = new RevisionedReportCache({ clock: () => time, ttlMs: 10, revision: { async readRevision() { return revision; } } });
const reports = new MonthlyStandingsReportService({ cache,
  userRepository: { async listUsers() { reads++; return data.users; } },
  rosterRepository: { async listRostersByMonth() { return data.rosters; } },
  playerCatalogRepository: { async listPlayers() { return data.players; } },
  calendarRepository: { async listCalendar() { return data.calendar; } },
  matchDataRepository: { async readDatabase() { return data.database; } } });
const results = await Promise.all(Array.from({ length: 20 }, () => reports.loadMonthlyReport(data.month)));
assert.equal(reads, 1); assert.equal(results[0].entries.length, 120);
time = 11;
const rebuilt = await reports.loadMonthlyReport(data.month);
assert.equal(reads, 2); assert.equal(rebuilt.version, results[0].version);
data.rosters[0].slots = []; revision++;
const changed = await reports.loadMonthlyReport(data.month);
assert.equal(reads, 3); assert.notEqual(changed.version, rebuilt.version);
assert.equal(changed.entries.find((entry) => entry.userId === "1").playersCount, 0);
console.log("Performance shared report, stable page versions and roster invalidation self-test passed");
