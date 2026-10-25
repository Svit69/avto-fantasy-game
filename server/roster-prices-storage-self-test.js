import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { PostgresRosterRepository } from "./PostgresRosterRepository.js";
import { createRosterPriceFixture } from "./roster-prices-test-fixture.js";

const fixture = await createRosterPriceFixture();
try {
  const repo = fixture.rosterRepository;
  await Promise.all(Array.from({ length: 20 }, (_, index) => repo.saveRoster(index, "next", fixture.slots)));
  assert.equal((await repo.listRosters()).length, 20);
  const original = await repo.findRosterByUserAndMonth(1, "next");
  const next = { ...original, status: "editing" };
  assert.equal((await repo.replaceRosterIfUnchanged(original, next, Date.now() + 60000)).status, "editing");
  assert.equal(await repo.replaceRosterIfUnchanged(original, original, Date.now() + 60000), null);
  assert.equal(await repo.replaceRosterIfUnchanged(next, original, Date.now() - 1), null);
  assert.equal((await repo.findRosterByUserAndMonth(1, "next")).status, "editing");
  let query; let params;
  const postgres = new PostgresRosterRepository({ async query(sql, values) { query = sql; params = values; return { rows: [{ payload: next }] }; } });
  assert.equal((await postgres.replaceRosterIfUnchanged(original, next, Date.now() + 60000)).status, "editing");
  assert.match(query, /r\.payload=c\.expected/); assert.match(query, /clock_timestamp\(\)/);
  assert.equal(JSON.parse(params[0])[0].expected.status, "confirmed");
  assert.equal((await postgres.saveRosterBeforeDeadline(1, "next", fixture.slots, Date.now() + 60000)).status, "editing");
  assert.match(query, /where clock_timestamp\(\) < \$4/);
  assert.equal(params[0], "1"); assert.equal(params[1], "next");
  const rejected = new PostgresRosterRepository({ async query() { return { rows: [] }; } });
  assert.equal(await rejected.saveRosterBeforeDeadline(1, "next", [], Date.now() - 1), null);
  await fs.writeFile(repo.filePath, "invalid", "utf8");
  await assert.rejects(repo.saveRoster(99, "next", []));
  assert.equal(await fs.readFile(repo.filePath, "utf8"), "invalid");
} finally { await fixture.close(); }
console.log("Roster JSON atomic writes, compare-and-swap, deadline and PostgreSQL query contract self-test passed");
