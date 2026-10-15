import assert from "node:assert/strict";
import { PostgresPlayerCatalogRepository } from "./PostgresPlayerCatalogRepository.js";

const seeds = Array.from({ length: 93 }, (_, index) => ({ id: String(index), price: 10, team: "Авто" }));
const stored = new Map([["0", { ...seeds[0], price: 17, team: "Горняк", teamHistory: ["Авто"] }]]);
let active = 0;
let maximum = 0;
let writes = 0;
const database = { query: async (sql, parameters) => {
  if (sql.startsWith("select")) return { rows: [...stored.values()].map((payload) => ({ payload })) };
  active++;
  maximum = Math.max(maximum, active);
  try {
    await new Promise((resolve) => setTimeout(resolve, 1));
    stored.set(parameters[0], JSON.parse(parameters[1]));
    writes++;
    return { rows: [] };
  } finally { active--; }
} };
const repository = new PostgresPlayerCatalogRepository(database, seeds, {});
const result = await repository.listPlayers();
assert.equal(result.length, 93);
assert.equal(writes, 93);
assert.equal(maximum, 1, "Catalog synchronization must not flood the small PostgreSQL pool");
assert.equal(stored.get("0").price, 17, "Preserve administrator prices");
assert.equal(stored.get("0").team, "Горняк", "Preserve player transfers");
await repository.listPlayers();
assert.equal(writes, 93, "An unchanged catalog must not be rewritten");
console.log("Player catalog bounded PostgreSQL writes self-test passed");
