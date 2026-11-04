import assert from "node:assert/strict";
import { createOnlineScheduleFixture } from "./online-schedule-test-fixture.js";
import { TourSchedulePolicy } from "../src/services/TourSchedulePolicy.js";
import { OnlineMatchScheduleRepository } from "./OnlineMatchScheduleRepository.js";
import { AtomicJsonDocumentStore } from "./AtomicJsonDocumentStore.js";
import path from "node:path";

const fixture = await createOnlineScheduleFixture();
try {
  const { observer, repository, match, observed, calendar, enricher } = fixture; const policy = new TourSchedulePolicy();
  await observer.observeMatch(match, observed);
  let enriched = await enricher.enrichCalendar(calendar);
  assert.equal(enriched.matches[0].startsAt, observed.scheduledAt);
  assert.equal(policy.findTourAccessState(enriched, "next", Date.parse(observed.scheduledAt) - 1).isLocked, false);
  assert.equal(policy.findTourAccessState(enriched, "next", Date.parse(observed.scheduledAt)).isLocked, true);
  fixture.setNow(Date.parse("2030-01-10T10:30:00+03:00"));
  await observer.observeMatch(match, { ...observed, status: "live" });
  enriched = await enricher.enrichCalendar(calendar);
  assert.equal(policy.findTourAccessState(enriched, "next", fixture.getNow()).isLocked, true);
  await observer.observeMatch(match, { ...observed, scheduledAt: "2030-01-10T18:00:00+03:00", status: "scheduled" });
  enriched = await enricher.enrichCalendar(calendar);
  assert.equal(enriched.matches[0].status, "live");
  assert.equal(policy.findTourAccessState(enriched, "next", fixture.getNow()).isLocked, true);
  const changedId = await enricher.enrichCalendar({ ...calendar, matches: [{ ...match, mhlGameId: "903311" }] });
  assert.equal(changedId.matches[0].startsAt, match.startsAt);
  assert.equal(policy.findTourAccessState(changedId, "next", fixture.getNow()).isLocked, true);
  for (const actual of [{ ...observed, gameId: "wrong" }, { ...observed, homeTeam: "Чужой клуб" },
    { ...observed, homeTeam: observed.awayTeam, awayTeam: observed.homeTeam }, { ...observed, scheduledAt: "2030-01-11T11:00:00+03:00" }]) {
    await assert.rejects(repository.recordObservation(match, actual), /identity_mismatch/);
  }
  const restarted = new OnlineMatchScheduleRepository(new AtomicJsonDocumentStore(path.join(fixture.directory, "observations.json")));
  assert.deepEqual(await restarted.listObservations(), await repository.listObservations());
  assert.ok(fixture.notices.some((args) => args[1].startsWith("schedule:"))); assert.ok(fixture.notices.some((args) => args[1] === "start"));
  console.log("Online schedule identity, earlier kickoff, persistent no-reopen lock and changed-ID safety self-test passed");
} finally { await fixture.close(); }
