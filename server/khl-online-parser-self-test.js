import assert from "node:assert/strict";
import { fixture, players, createProvider, createMemoryFactory, calendarMatch } from "./khl-online-test-context.js";
import { KhlOnlineMatchParser } from "./KhlOnlineMatchParser.js";
import { KhlOnlinePlayerMatcher } from "./KhlOnlinePlayerMatcher.js";
import { KhlOnlineGoalieParser } from "./KhlOnlineGoalieParser.js";

const factory = createMemoryFactory();
const provider = createProvider();
const result = await factory.createIngestionService(provider).ingestMatch("october", "902107");
assert.deepEqual(result.match.score, { homeGoals: 4, awayGoals: 0, decidedBy: null });
assert.equal(result.playerStats.length, 20); assert.deepEqual(provider.unmatchedPlayers, []);
const stats = new Map(result.playerStats.map((stat) => [stat.playerId, stat]));
assert.equal(stats.get("galkin").saves, 22); assert.equal(stats.get("galkin").fantasyPoints, 66);
assert.equal(stats.get("clague").shotsOnGoal, 1); assert.equal(stats.get("clague").fantasyPoints, 95);
assert.equal(stats.get("barabanov").assists, 2); assert.equal(stats.get("golyshev").assists || 0, 0);
for (const [ots, decidedBy] of [["ОТ", "overtime"], ["Б", "shootout"]]) {
  const game = structuredClone(fixture); game.info.data.ots = ots; game.info.data.score = "3:2";
  assert.equal(new KhlOnlineMatchParser().parseMatch(game).score.decidedBy, decidedBy);
}
const moved = players.map((player) => player.id === "clague" ? { ...player, team: "Горняк-УГМК", league: "ВХЛ" } : player);
const transferred = await createMemoryFactory([], moved).createIngestionService(createProvider(fixture, moved)).ingestMatch("october", "902107");
assert.equal(transferred.playerStats.find((stat) => stat.playerId === "clague").fantasyPoints, 95);
const row = { name: "Клэг Кейл", khlPlayerId: "unknown" };
assert.equal(new KhlOnlinePlayerMatcher(moved).findPlayer(row).id, "clague");
assert.equal(new KhlOnlinePlayerMatcher([moved[0], { ...moved[0], id: "duplicate" }]).findPlayer({ name: `${moved[0].lastName} ${moved[0].firstName}` }), null);
const away = structuredClone(fixture); away.players.B = away.players.A; away.tab_stats.playerstats.B = away.tab_stats.playerstats.A;
away.teams.home.name = "Авангард"; away.teams.visitor.name = "Автомобилист";
assert.equal(new KhlOnlineMatchParser().parseMatch(away).awayTeam, "Автомобилист");
const incomplete = structuredClone(fixture); incomplete.tab_stats.playerstats.A[0].data.pop();
await assert.rejects(() => createProvider(incomplete).getMatch(), /totals_mismatch/);
const wrong = { ...calendarMatch, awayTeam: "Трактор" };
await assert.rejects(() => createProvider(fixture, players, wrong).getMatch(), /calendar_mismatch/);
const missing = structuredClone(fixture); delete missing.tab_stats.playerstats.A[0].data[0].stats.shots;
await assert.rejects(() => createProvider(missing).getMatch(), /columns_missing/);
const goalieGame = structuredClone(fixture); goalieGame.players.A[50].ig = 1;
goalieGame.tab_events = [{ events: [{ type: "gc", teamAB: "A", time_sec: 600, prevGk: 1, gkJn: 50, id: 1 },
  { type: "gc", teamAB: "A", time_sec: 1200, prevGk: 50, gkJn: 0, id: 2 }] }];
const keepers = new KhlOnlineGoalieParser().parseRows(goalieGame, "A");
assert.equal(keepers.length, 2); assert.ok(keepers.reduce((sum, keeper) => sum + keeper.saves, 0) < 22);
console.log("KHL online real 902107 parsing, transfers, score and incomplete data self-test passed");
