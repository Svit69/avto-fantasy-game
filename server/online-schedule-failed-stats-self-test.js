import assert from "node:assert/strict";
import { createOnlineScheduleFixture } from "./online-schedule-test-fixture.js";
import { createMhlGoalieFallbackFixture } from "./mhl-goalie-fallback-test-fixture.js";
import { MhlMirrorDataSource } from "./MhlMirrorDataSource.js";
import { MhlMirrorDataProvider } from "./MhlMirrorDataProvider.js";
import { MhlOfficialGoalieDataSource } from "./MhlOfficialGoalieDataSource.js";
import { calendarMatch, players, createMemoryFactory } from "./mhl-online-test-context.js";
import { TourSchedulePolicy } from "../src/services/TourSchedulePolicy.js";

const fixture = await createOnlineScheduleFixture();
try {
  const { snapshot } = createMhlGoalieFallbackFixture();
  const source = new MhlMirrorDataSource(async () => new Response(JSON.stringify(snapshot)), 1000,
    new MhlOfficialGoalieDataSource(async () => new Response("blocked", { status: 403 })));
  const provider = new MhlMirrorDataProvider({ gameId: "903207", players, expectedMatch: calendarMatch,
    scheduleObserver: fixture.observer, dataSource: source });
  const factory = createMemoryFactory();
  await assert.rejects(factory.createIngestionService(provider).ingestMatch(calendarMatch.tourId, "903207"), (error) =>
    error.message === "mhl_goalie_protocol_http_403" && error.observedMatch.status === "finished");
  assert.equal(factory.data.writes, 0);
  const observations = await fixture.repository.listObservations();
  assert.equal(observations[0].id, calendarMatch.id); assert.notEqual(observations[0].startedAt, null);
  const calendar = await fixture.enricher.enrichCalendar({ tours: [{ id: calendarMatch.tourId, month: "current", deadlineAt: "2026-10-15T19:00:00+03:00" }], matches: [calendarMatch] });
  assert.equal(new TourSchedulePolicy().findTourAccessState(calendar, "current", Date.parse("2026-10-15T17:00:00+03:00")).isLocked, true);
  console.log("MHL failed goalie/PDF collection still records verified match start and closes roster self-test passed");
} finally { await fixture.close(); }
