import assert from "node:assert/strict";
import { RosterDeadlineAuditService } from "./RosterDeadlineAuditService.js";
const calendar = { tours: [{ id: "tour", month: "Ноябрь", deadlineAt: "2026-11-04T16:30:00+03:00" }],
  matches: [{ tourId: "tour", startsAt: "2026-11-04T11:00:00+03:00" }] };
const rosters = [{ userId: "early", updated_at: "2026-11-04T10:59:59+03:00" },
  { userId: "late", updated_at: "2026-11-04T11:00:00+03:00" }, { userId: "unknown" }];
const before = JSON.stringify(rosters);
const report = await new RosterDeadlineAuditService({ listCalendar: async () => calendar }, { listRostersByMonth: async () => rosters }).createAuditReport("Ноябрь");
assert.deepEqual(report.potentiallyLateRosters.map((item) => item.userId), ["late"]);
assert.deepEqual(report.unverifiableRosters.map((item) => item.userId), ["unknown"]); assert.equal(JSON.stringify(rosters), before);
console.log("Read-only roster audit uses earliest verified kickoff and preserves existing lineups self-test passed");
