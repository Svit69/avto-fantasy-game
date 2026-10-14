import assert from "node:assert/strict";
import { SeasonPlayerStatsService } from "./SeasonPlayerStatsService.js";

const now = new Date("2026-10-14T00:00:00Z");
const calendar = { matches: ["a", "b", "c", "live", "future"].map((id) => ({ id, gameId: id })) };
const matches = [
  { id: "old-a", gameId: "a", status: "finished", scheduledAt: "2026-09-01", updatedAt: "2026-09-01" },
  { id: "a", gameId: "a", league: "ВХЛ", status: "finished", scheduledAt: "2026-09-01", updatedAt: "2026-09-02" },
  { id: "b", gameId: "b", league: "МХЛ", status: "finished", scheduledAt: "2026-09-02" },
  { id: "c", gameId: "c", league: "МХЛ", status: "finished", scheduledAt: "2026-10-01" },
  { id: "live", gameId: "live", status: "live", scheduledAt: "2026-10-13" },
  { id: "future", gameId: "future", status: "finished", scheduledAt: "2026-11-01" },
];
const playerStats = [
  { playerId: "p", matchId: "old-a", fantasyPoints: 999 },
  { playerId: "p", matchId: "a", fantasyPoints: 10, goals: 1 },
  { playerId: "p", matchId: "b", fantasyPoints: 20, assists: 1 },
  { playerId: "p", matchId: "c", fantasyPoints: 90, goals: 2, assists: 3 },
  { playerId: "p", matchId: "live", fantasyPoints: 999 },
  { playerId: "p", matchId: "future", fantasyPoints: 999 },
  { playerId: "zero", matchId: "a", fantasyPoints: 0 },
  { playerId: "zero", matchId: "b", fantasyPoints: -10 },
];
const repository = { readDatabase: async () => ({ matches, playerStats }) };
const stats = await new SeasonPlayerStatsService(repository).createSeasonPlayerStats(calendar, now);
assert.deepEqual(stats.find((stat) => stat.playerId === "p"), { playerId: "p", matches: 3, fantasyPoints: 40, goals: 3, assists: 4 });
assert.equal(stats.find((stat) => stat.playerId === "zero").fantasyPoints, -5);
const optimized = { listMatches: async () => matches, listStatsByMatchIds: async (ids) => playerStats.filter((stat) => ids.includes(stat.matchId)) };
assert.deepEqual(await new SeasonPlayerStatsService(optimized).createSeasonPlayerStats(calendar, now), stats);
assert.deepEqual(await new SeasonPlayerStatsService(repository).createSeasonPlayerStats({ matches: [] }, now), []);
console.log("Market season averages, transfers and import deduplication self-test passed");
