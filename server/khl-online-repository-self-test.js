import assert from "node:assert/strict";
import { KhlMatchDataRepository } from "./KhlMatchDataRepository.js";
import { PostgresKhlMatchDataRepository } from "./PostgresKhlMatchDataRepository.js";

const online = { id: "online", gameId: "902107", sourceType: "khl-online", updatedAt: "2026-10-16T00:00:00Z" };
const manual = { id: "manual", gameId: "902107", sourceType: "protocol", updatedAt: "2026-10-06T00:00:00Z" };
const database = { matches: [online, manual], events: [{ matchId: online.id }, { matchId: manual.id }],
  playerStats: [{ matchId: online.id, fantasyPoints: 999 }, { matchId: manual.id, fantasyPoints: 95 }],
  pointEntries: [{ matchId: online.id }, { matchId: manual.id }] };
for (const repository of [new KhlMatchDataRepository("unused"), new PostgresKhlMatchDataRepository({})]) {
  repository.readDatabase = async () => database;
  assert.equal((await repository.findMatchByGameId("902107")).id, "manual");
  assert.equal((await repository.listStatsByGameId("902107"))[0].fantasyPoints, 95);
  assert.equal((await repository.listEventsByGameId("902107"))[0].matchId, "manual");
  assert.equal((await repository.listPointEntriesByGameId("902107"))[0].matchId, "manual");
}
console.log("KHL JSON and PostgreSQL game API protocol priority self-test passed");
