import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { createRosterPriceHttpFixture } from "./roster-prices-http-fixture.js";
import { OnlineMatchScheduleRepository } from "./OnlineMatchScheduleRepository.js";

const fixture = await createRosterPriceHttpFixture();
try {
  const calendar = structuredClone(fixture.calendar);
  const startsAt = new Date(Date.now() + 3600000).toISOString();
  const match = { id: "earlier-game", tourId: "next", league: "МХЛ", homeTeam: "МХК Авто", awayTeam: "Спутник", mhlGameId: "903207", startsAt };
  calendar.matches = [match];
  await fs.writeFile(path.join(fixture.directory, "storage/calendar.json"), JSON.stringify(calendar), "utf8");
  const slots = fixture.slots.map((slot, index) => ({ ...slot, lockedPrice: index ? 15 : 5 }));
  await fixture.storage.createPlayerCatalogRepository().updatePlayerPrice("p0", 5);
  const submit = () => fetch(`${fixture.origin}/api/roster`, { method: "POST", headers: fixture.headers, body: JSON.stringify({ month: "next", slots }) });
  assert.equal((await submit()).status, 200);
  const before = await fixture.storage.createRosterRepository().findRosterByUserAndMonth(1, "next");
  await new OnlineMatchScheduleRepository().recordObservation(match,
    { gameId: "903207", league: match.league, homeTeam: match.homeTeam, awayTeam: match.awayTeam, scheduledAt: startsAt, status: "live" });
  const response = await submit(); assert.equal(response.status, 423); assert.equal((await response.json()).error, "tour_started");
  assert.deepEqual(await fixture.storage.createRosterRepository().findRosterByUserAndMonth(1, "next"), before);
  const calendarResponse = await fetch(`${fixture.origin}/api/calendar`, { headers: fixture.headers }); assert.equal(calendarResponse.status, 200);
  const api = await calendarResponse.json();
  assert.ok(Date.parse(api.tours.find((tour) => tour.id === "next").deadlineAt) <= Date.now());
  console.log("Real HTTP roster save is rejected after confirmed early start without changing saved lineup self-test passed");
} finally { await fixture.close(); }
