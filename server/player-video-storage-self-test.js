import assert from "node:assert/strict";
import path from "node:path";
import { PlayerCatalogRepository } from "./PlayerCatalogRepository.js";
import { PostgresPlayerCatalogRepository } from "./PostgresPlayerCatalogRepository.js";
import { createOperationsTestWorkspace } from "./operations-test-workspace.js";
const workspace = await createOperationsTestWorkspace();
try {
  const seed = [{ id: "p", firstName: "Игрок", lastName: "Тест", price: 12, team: "Авто" }];
  const file = path.join(workspace.directory, "players.json");
  const video = { fileId: "recorded-video", uploadedAt: "2026-10-16T00:00:00Z" };
  const repository = new PlayerCatalogRepository(file, seed, {});
  await repository.updatePlayerVideoNote("p", video);
  const reloaded = new PlayerCatalogRepository(file, seed, {});
  assert.deepEqual((await reloaded.findPlayerById("p")).videoNote, video);
  await reloaded.updatePlayerPrice("p", 15);
  assert.deepEqual((await reloaded.findPlayerById("p")).videoNote, video);
  await reloaded.markPlayerLeftGame("p");
  assert.equal((await reloaded.findPlayerById("p")).status, "left_game");
  await reloaded.updatePlayerVideoNote("p", null);
  assert.equal((await reloaded.findPlayerById("p")).videoNote, null);
  const records = new Map();
  const database = { query: async (sql, parameters = []) => {
    if (sql.startsWith("insert")) { records.set(parameters[0], JSON.parse(parameters[1])); return { rows: [] }; }
    const selected = parameters.length ? [records.get(parameters[0])].filter(Boolean) : [...records.values()];
    return { rows: selected.map((payload) => ({ payload })) };
  } };
  const postgres = new PostgresPlayerCatalogRepository(database, seed, {});
  await postgres.updatePlayerVideoNote("p", video);
  assert.deepEqual((await new PostgresPlayerCatalogRepository(database, seed, {}).findPlayerById("p")).videoNote, video);
  await postgres.updatePlayerVideoNote("p", null);
  assert.equal(records.get("p").videoNote, null);
} finally { await workspace.close(); }
console.log("Player video JSON and PostgreSQL metadata persistence self-test passed");
