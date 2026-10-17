import assert from "node:assert/strict";
import { load } from "cheerio";
import { html, players, calendarMatch, createProvider, createMemoryFactory } from "./mhl-online-test-context.js";
import { MhlOnlineRosterParser } from "./MhlOnlineRosterParser.js";
import { MhlOnlinePenaltyMinutesParser } from "./MhlOnlinePenaltyMinutesParser.js";
import { OnlineHockeyPlayerNameMatcher } from "./OnlineHockeyPlayerNameMatcher.js";

const reordered = load(html);
for (const node of reordered("#tab-statsA-part0 tr").toArray()) {
  const row = reordered(node); const cells = row.children("th, td");
  if (cells.length > 6) { const goals = cells.eq(2); const assists = cells.eq(3); goals.replaceWith(assists.clone()); assists.replaceWith(goals); }
}
const provider = createProvider(players, reordered.html());
const result = await createMemoryFactory().createIngestionService(provider).ingestMatch("october", "903207");
assert.equal(result.playerStats.find((stat) => stat.playerId === "gashilov").assists, 3);
for (const [selector, action, reason] of [
  ["#tab-statsA-part0 tbody tr", "first", /skater_totals_mismatch/],
  ["#tab-game-playbyplay [data-result=saved]", "all", /goalie_events_incomplete/],
  ["#tab-statsA-part0 th", "shots", /columns_missing/],
]) {
  const changed = load(html);
  if (action === "first") changed(selector).first().remove();
  else if (action === "shots") changed(selector).filter((index, node) => changed(node).text() === "БВ").text("БМ");
  else changed(selector).remove();
  await assert.rejects(() => createProvider(players, changed.html()).getMatch(), reason);
}
const wrongScore = load(html); wrongScore(".game_info_score-item-h").text("8");
await assert.rejects(() => createProvider(players, wrongScore.html()).getMatch(), /score_totals_mismatch/);
await assert.rejects(() => createProvider(players, html, { ...calendarMatch, awayTeam: "Локо" }).getMatch(), /calendar_mismatch/);
await assert.rejects(() => createProvider(players, html, { ...calendarMatch, startsAt: "2026-10-16" }).getMatch(), /calendar_mismatch/);
assert.throws(() => new MhlOnlineRosterParser().parseRoster(load('<script>let gamePlayers = JSON.parse(runCode());</script>')), /format_invalid/);
const minutes = new MhlOnlinePenaltyMinutesParser();
assert.equal(minutes.parseMinutes("Штраф (буллит)"), 0); assert.equal(minutes.parseMinutes("Штраф (2+2 мин)"), 4);
assert.throws(() => minutes.parseMinutes("Штраф (?)"), /minutes_missing/);
const scheduled = load(html); scheduled(".game_info_score-byperiod_val").text("Матч ещё не начался");
scheduled("#tab-game-playbyplay, #tab-statsA-part0, #tab-statsB-part0, #tab-statsteams-part0").remove();
assert.equal((await createProvider(players, scheduled.html()).getMatch()).status, "scheduled");
const unknown = load(html); unknown(".game_info_score-byperiod_val").text("Неизвестное состояние");
await assert.rejects(() => createProvider(players, unknown.html()).getMatch(), /status_unknown/);
assert.equal(new OnlineHockeyPlayerNameMatcher().isSamePlayer({ lastName: "Иванов", firstName: "Лев" }, "Иванов Леонид Е."), false);
assert.equal(new OnlineHockeyPlayerNameMatcher().isSamePlayer({ lastName: "Воробьев", firstName: "Кирилл" }, "Воробьёв Кирилл"), true);
console.log("MHL reordered columns, missing data, unsafe scripts and calendar validation self-test passed");
