import assert from "node:assert/strict";
import { load } from "cheerio";
import { html, decisions, players, calendarMatch, createProvider, createMemoryFactory } from "./mhl-online-test-context.js";
import { MhlOnlineMatchInfoParser } from "./MhlOnlineMatchInfoParser.js";
import { KhlOnlineScoreParser } from "./KhlOnlineScoreParser.js";
import { MhlMirrorDataProvider } from "./MhlMirrorDataProvider.js";
import { MhlOnlineHtmlParser } from "./MhlOnlineHtmlParser.js";

assert.ok(calendarMatch?.mhlGameId);
const provider = createProvider();
const result = await createMemoryFactory().createIngestionService(provider).ingestMatch(calendarMatch.tourId, "903207");
assert.equal(result.ok, true); assert.equal(result.match.sourceType, "mhl-online");
assert.deepEqual(result.match.score, { homeGoals: 7, awayGoals: 2, decidedBy: null });
assert.equal(result.match.homeTeam, "МХК Авто"); assert.equal(result.match.awayTeam, "Спутник");
assert.equal(provider.rows.length, 21); assert.equal(result.playerStats.length, 20);
assert.deepEqual(provider.unmatchedPlayers, ["Привалов Егор"]);
const stats = new Map(result.playerStats.map((stat) => [stat.playerId, stat]));
assert.equal(stats.get("gamzakov").shotsOnGoal, 7); assert.equal(stats.get("gamzakov").fantasyPoints, 13);
assert.equal(stats.get("gamzakov").assists || 0, 0); assert.equal(stats.get("gashilov").assists, 3);
assert.equal(stats.get("gashilov").fantasyPoints, 90); assert.equal(stats.get("minaev").saves, 17);
assert.equal(stats.get("minaev").goalsAgainst, 2); assert.equal(stats.get("minaev").fantasyPoints, 11);
for (const [index, decidedBy] of [[0, "shootout"], [1, "overtime"]]) {
  const parsed = new MhlOnlineMatchInfoParser().parseMatchInfo(load(decisions[index].html), decisions[index].gameId);
  assert.equal(new KhlOnlineScoreParser().parseScore(parsed.info.data, "finished").decidedBy, decidedBy);
}
const moved = players.map((player) => player.id === "gamzakov" ? { ...player, team: "Горняк-УГМК", league: "ВХЛ" } : player);
const transfer = await createMemoryFactory([], moved).createIngestionService(createProvider(moved)).ingestMatch("october", "903207");
assert.equal(transfer.playerStats.find((stat) => stat.playerId === "gamzakov").fantasyPoints, 13);
const game = new MhlOnlineHtmlParser().parseGame(html, "903207");
[game.teams.home, game.teams.visitor] = [game.teams.visitor, game.teams.home];
[game.info.data.teama, game.info.data.teamb] = [game.info.data.teamb, game.info.data.teama];
game.info.data.score = "2:7"; [game.players.A, game.players.B] = [game.players.B, game.players.A];
[game.tab_stats.playerstats.A, game.tab_stats.playerstats.B] = [game.tab_stats.playerstats.B, game.tab_stats.playerstats.A];
const swap = (side) => side === "A" ? "B" : "A";
for (const item of game.tab_stats.teamstats[0].data) item.team = swap(item.team);
for (const events of Object.values(game.tab_playbyplay.gameLegend)) for (const event of events) event.teamAB = swap(event.teamAB);
for (const event of game.tab_events[0].events) { if (event.teamAB) event.teamAB = swap(event.teamAB); if (event.team) event.team = swap(event.team); }
const away = new MhlMirrorDataProvider({ gameId: "903207", players, expectedMatch: { ...calendarMatch, homeTeam: "Спутник", awayTeam: "МХК Авто" }, dataSource: { loadGame: async () => game } });
await away.getMatch(); assert.equal(away.rows.find((row) => row.name === "Минаев Ефим").saves, 17);
console.log("MHL real 903207 stats, transfers, away team and real overtime/shootout headers self-test passed");
