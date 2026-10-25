import assert from "node:assert/strict";
import { AutoRosterCandidateService } from "./AutoRosterCandidateService.js";
import { createAutoRosterFixture } from "./auto-roster-test-fixture.js";

const fixture = await createAutoRosterFixture();
try {
  const calendarMatch = fixture.calendar.matches.find((match) => match.id === "current-A");
  const match = { ...calendarMatch, scheduledAt: calendarMatch.startsAt, status: "finished", sourceType: "protocol" };
  fixture.players.find((player) => player.id === "A1").status = "left_game";
  fixture.players.find((player) => player.id === "B0").price = -1;
  fixture.players.push({ id: "extra", team: "No games", position: "вратарь", price: 1 });
  const candidates = new AutoRosterCandidateService({ ...fixture, matchDataRepository: { async readDatabase() {
    return { matches: [match], playerStats: [{ matchId: match.id, playerId: "A0", fantasyPoints: 100 }] };
  } } });
  const tour = fixture.calendar.tours.find((item) => item.id === "next");
  const result = await candidates.loadCandidates(fixture.calendar, tour);
  assert.ok(result.find((player) => player.id === "A0").autoScore > 0);
  assert.ok(!result.some((player) => ["A1", "B0", "extra"].includes(player.id)));
  assert.equal(result.find((player) => player.id === "C5").autoScore, 0);
} finally { await fixture.close(); }
console.log("Autofill season forecast, unavailable players, invalid prices and club calendar eligibility self-test passed");
