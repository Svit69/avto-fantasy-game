import assert from "node:assert/strict";
import { BudgetedAutoRosterSelector } from "./BudgetedAutoRosterSelector.js";
import { createAutoRosterFixture } from "./auto-roster-test-fixture.js";

const fixture = await createAutoRosterFixture();
try {
  const selector = new BudgetedAutoRosterSelector();
  const selected = selector.selectPlayers(fixture.players);
  assert.equal(selected.length, 6); assert.equal(new Set(selected.map((player) => player.id)).size, 6);
  assert.deepEqual(selected.map((player) => player.position), ["нападающий", "нападающий", "нападающий", "защитник", "защитник", "вратарь"]);
  assert.ok(selected.reduce((sum, player) => sum + player.price, 0) <= 90);
  for (const team of ["A", "B", "C"]) assert.ok(selected.filter((player) => player.team === team).length <= 4);
  assert.equal(selector.selectPlayers(fixture.players.map((player) => ({ ...player, price: 100 }))), null);
  assert.equal(selector.selectPlayers(fixture.players.filter((player) => player.team === "A")), null);
  assert.equal(selector.selectPlayers(fixture.players.filter((player) => player.position !== "вратарь")), null);
  const unranked = fixture.players.map((player) => ({ ...player, autoScore: 0 }));
  assert.ok(selector.selectPlayers(unranked));
  const starred = unranked.map((player) => ({ ...player, autoScore: player.id === "C5" ? 1000 : 0 }));
  assert.ok(selector.selectPlayers(starred).some((player) => player.id === "C5"));
} finally { await fixture.close(); }
console.log("Autofill budget, positions, club cap, scoring preference and unavailable pools self-test passed");
