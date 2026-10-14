import assert from "node:assert/strict";
import { Player } from "../src/models/Player.js";
import { PlayerTourPointsCoordinator } from "../src/services/PlayerTourPointsCoordinator.js";
import { PlayerMarketStatsStore } from "../src/services/PlayerMarketStatsStore.js";

const calendar = { tours: [
  { month: "Сентябрь", deadlineAt: "2000-09-01" },
  { month: "Октябрь", deadlineAt: "2100-10-01" },
] };
const player = new Player({ id: "p", firstName: "Михаил", lastName: "Гамзаков" });
let seasonCalls = 0;
const api = {
  loadMonthlyPlayerTourStats: async () => [{ playerId: "p", fantasyPoints: 10, goals: 1, assists: 2 }],
  loadSeasonPlayerStats: async () => { seasonCalls++; return [{ playerId: "p", fantasyPoints: 25, goals: 4, assists: 6 }]; },
  createEmptyStats: (playerId) => ({ playerId, fantasyPoints: 0 }),
};
const coordinator = new PlayerTourPointsCoordinator(api, { loadFantasyCalendar: async () => calendar });
await coordinator.applyTourPoints([player], "Октябрь");
assert.equal(PlayerMarketStatsStore.readPlayerStats(player).fantasyPoints, 25);
assert.equal(player.getPoints(), 10, "Season market values must not replace roster card values");
await coordinator.applyTourPoints([player], "Сентябрь");
assert.equal(seasonCalls, 1, "Started tours retain monthly statistics");
assert.equal(PlayerMarketStatsStore.readPlayerStats(player).goals, 1);
let finishOldRequest;
const race = new PlayerTourPointsCoordinator(api, { loadFantasyCalendar: () => new Promise((resolve) => { finishOldRequest = resolve; }) });
const older = race.applyTourPoints([player], "Октябрь");
race.calendarApiClient = { loadFantasyCalendar: async () => calendar };
await race.applyTourPoints([player], "Сентябрь");
finishOldRequest(calendar);
await older;
assert.equal(PlayerMarketStatsStore.readPlayerStats(player).fantasyPoints, 10, "A stale month response must not overwrite the selected month");
console.log("Market upcoming tour data scope and month race self-test passed");
