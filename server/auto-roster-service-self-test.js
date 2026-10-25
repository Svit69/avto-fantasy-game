import assert from "node:assert/strict";
import { createAutoRosterFixture } from "./auto-roster-test-fixture.js";
import { AutoRosterSubmissionService } from "./AutoRosterSubmissionService.js";

const fixture = await createAutoRosterFixture();
try {
  const { service, rosterRepository } = fixture;
  assert.equal((await service.fillRoster(3)).type, "registration");
  assert.equal((await service.fillRoster(4)).type, "registration");
  assert.equal((await service.fillRoster(99)).type, "registration");
  assert.equal((await service.fillRoster(1, "past")).type, "closed");
  assert.equal((await service.fillRoster(1, "closed")).type, "closed");
  assert.equal((await service.fillRoster(1, "unknown")).type, "closed");
  const results = await Promise.all([service.fillRoster(1), service.fillRoster(1)]);
  assert.deepEqual(results.map((result) => result.type).sort(), ["existing", "saved"]);
  const saved = await rosterRepository.findRosterByUserAndMonth(1, "next");
  assert.equal(saved.status, "confirmed"); assert.equal(saved.slots.length, 6);
  await service.fillRoster(1); assert.deepEqual(await rosterRepository.findRosterByUserAndMonth(1, "next"), saved);
  const stale = new AutoRosterSubmissionService({ ...fixture, candidates: { async loadCandidates() {
    fixture.players.forEach((player) => { player.price = 100; }); return [];
  } } });
  assert.equal((await stale.fillRoster(2)).type, "unavailable");
  assert.equal(await rosterRepository.findRosterByUserAndMonth(2, "next"), null);
  fixture.players.forEach((player) => { player.price = 10; });
  const late = new AutoRosterSubmissionService({ ...fixture, candidates: { async loadCandidates() {
    fixture.calendar.tours.find((tour) => tour.id === "next").deadlineAt = new Date(Date.now() - 1).toISOString(); return [];
  } } });
  assert.equal((await late.fillRoster(2)).type, "closed");
  assert.equal(await rosterRepository.saveRosterBeforeDeadline(2, "next", [], Date.now() - 1), null);
  assert.equal(await rosterRepository.findRosterByUserAndMonth(2, "next"), null);
} finally { await fixture.close(); }
console.log("Autofill registration, tour identity, double click, current prices and deadline self-test passed");
