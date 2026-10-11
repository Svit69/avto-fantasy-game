import assert from "node:assert/strict";
import { PlayerPriceBudgetPolicy } from "./PlayerPriceBudgetPolicy.js";
import { PriceReviewRosterOptimizer } from "./PriceReviewRosterOptimizer.js";

const positions = ["нападающий", "нападающий", "нападающий", "защитник", "защитник", "вратарь"];
const players = ["A", "B"].flatMap((team, group) => positions.map((position, index) => ({ id: `${team}-${index}`, position, team, price: group ? 10 : 20 })));
players[0].price = 29;
const performances = players.map((player) => ({ player }));
const proposals = [{ reason: "recommendation", player: players[0], suggestedPrice: 30, gap: 10 },
  ...players.filter((player) => player.team === "B").map((player) => ({ reason: "recommendation", player, suggestedPrice: 11, gap: 1 }))];
const original = JSON.stringify({ players, proposals });
const policy = new PlayerPriceBudgetPolicy();
const result = policy.protectAffordability(proposals, performances, { limit: 90 });
assert.equal(result.evaluations[0].reason, "recommendation", "Strongest individually affordable increase must not be lost to batch rejection");
assert(result.evaluations.some((item) => item.reason === "budget"));
const accepted = result.evaluations.filter((item) => item.reason === "recommendation");
const prices = new Map(accepted.map((item) => [item.player.id, item.suggestedPrice]));
const finalPlayers = players.map((player) => ({ ...player, price: prices.get(player.id) ?? player.price }));
const optimizer = new PriceReviewRosterOptimizer();
for (const item of accepted) {
  assert(optimizer.findOptimalRoster(finalPlayers, undefined, item.player.id).cost <= 90, "Later increases must not invalidate earlier approvals");
  assert(item.affordableRosterCost <= 90);
}
const reversed = policy.protectAffordability([...proposals].reverse(), performances, { limit: 90 });
assert.deepEqual(reversed.evaluations.filter((item) => item.reason === "recommendation").map((item) => item.player.id).sort(), accepted.map((item) => item.player.id).sort());
assert.equal(JSON.stringify({ players, proposals }), original, "Planner must not mutate prices or suggestions");
assert.equal(optimizer.findOptimalRoster(players.map((player) => ({ ...player, price: 0 }))).cost, 0, "Free players remain valid roster options");
console.log("Player price review affordability planner self-test passed");
