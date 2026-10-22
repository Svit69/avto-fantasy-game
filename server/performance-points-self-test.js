import assert from "node:assert/strict";
import { SyntheticLoadFixture } from "./SyntheticLoadFixture.js";
import { MonthlyPlayerPointsCalculator } from "./MonthlyPlayerPointsCalculator.js";
import { PlayerTourStatsCalculator } from "./PlayerTourStatsCalculator.js";

const data = new SyntheticLoadFixture().createData(3);
const legacy = new PlayerTourStatsCalculator();
const verify = () => {
  const points = new MonthlyPlayerPointsCalculator().createPlayerPointsMap(data.players, data.month, data.calendar, data.database);
  for (const player of data.players) assert.equal(points.get(player.id), legacy.createMonthlyPlayerStats({
    playerId: player.id, month: data.month, calendar: data.calendar, matchDatabase: data.database
  }).fantasyPoints, player.id);
};
verify();
const original = data.database.matches[0];
const duplicate = { ...original, id: "reimport", updatedAt: "2026-10-22T12:00:00Z" };
const online = { ...original, id: "online", sourceType: "khl-online", updatedAt: "2026-10-23T12:00:00Z" };
data.database.matches.push(duplicate, online);
const first = data.database.playerStats[0];
data.database.playerStats.push({ ...first, matchId: duplicate.id, fantasyPoints: -40 }, { ...first, matchId: online.id, fantasyPoints: 999 });
const transferred = data.database.matches.find((match) => match.featuredTeam !== original.featuredTeam);
data.database.playerStats.push({ ...first, matchId: transferred.id, fantasyPoints: 0 });
data.database.playerStats.push({ ...first, matchId: "unknown", fantasyPoints: 999 });
verify();
assert.equal(new MonthlyPlayerPointsCalculator().createPlayerPointsMap([{ id: "missing" }], data.month, data.calendar, data.database).get("missing"), 0);
console.log("Performance bulk points equivalence, transfers and protocol priority self-test passed");
