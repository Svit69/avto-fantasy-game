import assert from "node:assert/strict";
import { load } from "cheerio";
import { createOnlineScheduleFixture } from "./online-schedule-test-fixture.js";
import { MhlOnlineScheduleProbe } from "./MhlOnlineScheduleProbe.js";
import { KhlOnlineScheduleAwareMatchSelector } from "./KhlOnlineScheduleAwareMatchSelector.js";
import { OnlineHockeyLeagueConfiguration } from "./OnlineHockeyLeagueConfiguration.js";
import { html, calendarMatch } from "./mhl-online-test-context.js";

const fixture = await createOnlineScheduleFixture();
try {
  const selector = new KhlOnlineScheduleAwareMatchSelector(OnlineHockeyLeagueConfiguration.mhl());
  const now = Date.parse(calendarMatch.startsAt) - 6 * 3600000;
  const calendar = { matches: [calendarMatch] };
  assert.equal(selector.findDueMatches(calendar, {}, now)[0].isScheduleProbe, true);
  assert.equal(selector.findDueMatches(calendar, {}, now - 25 * 3600000).length, 0);
  assert.equal(selector.findDueMatches(calendar, { [calendarMatch.id]: { nextPollAt: now + 1 } }, now).length, 0);
  assert.equal(selector.findDueMatches(calendar, { [calendarMatch.id]: { completedAt: now - 1 } }, now).length, 0);
  const headerOnly = load(html); headerOnly("#tab-game-playbyplay, #tab-statsA-part0, #tab-statsB-part0, script").remove();
  const probe = new MhlOnlineScheduleProbe(fixture.observer, async (url) => {
    assert.equal(url, "https://text.mhl.khl.ru/903207.html"); return new Response(headerOnly.html());
  });
  const result = await probe.inspectMatch(calendarMatch, {});
  assert.equal(result.state.sourceStatus, "finished"); assert.equal((await fixture.repository.listObservations()).length, 1);
  await assert.rejects(probe.inspectMatch({ ...calendarMatch, awayTeam: "Чужой клуб" }, {}), /calendar_mismatch/);
  console.log("MHL 24-hour lightweight header preparation, bounded schedule polling and identity verification self-test passed");
} finally { await fixture.close(); }
