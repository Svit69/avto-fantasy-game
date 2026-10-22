import assert from "node:assert/strict";
import { StandingsPageFactory } from "./StandingsPageFactory.js";
import { StandingsController } from "./StandingsController.js";

const factory = new StandingsPageFactory();
const report = { month: "test", version: "v1", entries: Array.from({ length: 120 }, (_, i) => ({ userId: String(i), place: i + 1 })), leaders: [] };
const page = (query, user = "100") => factory.createResponse(report, user, new URLSearchParams(query));
assert.equal(page("summary=1").currentUser.place, 101);
assert.equal(page("summary=1").entries, undefined);
assert.equal(page("summary=1", "3").currentUser.place, 4);
assert.equal(page("summary=1", "missing").currentUser, null);
assert.equal(page("limit=50").entries.length, 50);
assert.equal(page("limit=50").nextOffset, 50);
assert.equal(page("limit=50&offset=50&version=v1").entries[0].place, 51);
assert.equal(page("limit=50&offset=100&version=v1").nextOffset, null);
assert.equal(page("limit=50&offset=50&version=stale").offset, 0);
for (const query of ["limit=0", "limit=101", "limit=x", "limit=50&offset=-1"]) assert.throws(() => page(query), { statusCode: 400 });
let loads = 0; let response;
const controller = new StandingsController({ profileResolver: { async resolveProfile() { return null; } },
  reports: { async loadMonthlyReport() { loads++; return report; } }, jsonResponder: { sendJson(_response, status, body) { response = { status, body }; } } });
await controller.handleRequest({ method: "GET", url: "/api/standings", headers: { host: "localhost" } }, {});
assert.equal(response.status, 401); assert.equal(loads, 0);
console.log("Performance standings pagination, personalization and authorization self-test passed");
