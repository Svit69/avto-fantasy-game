import assert from "node:assert/strict";
import { PlayerPriceReviewMath } from "./PlayerPriceReviewMath.js";
import { PlayerPriceEvidencePolicy } from "./PlayerPriceEvidencePolicy.js";
import { GoalkeeperPriceEvidencePolicy } from "./GoalkeeperPriceEvidencePolicy.js";
import { PlayerPricePeerBenchmark } from "./PlayerPricePeerBenchmark.js";

const policy = new PlayerPriceEvidencePolicy();
const stable = { count: 10, stability: 1, dataAgeDays: 0 };
assert.equal(policy.calculateConfidence({ ...stable, count: 100 }), policy.calculateConfidence(stable), "Season history must not inflate recent sample confidence");
assert(policy.calculateConfidence({ ...stable, count: 3 }) < policy.calculateConfidence(stable));
assert(policy.calculateConfidence({ ...stable, stability: 0.2 }) < policy.calculateConfidence(stable));
assert(policy.calculateConfidence({ ...stable, dataAgeDays: 90 }) < policy.calculateConfidence(stable));
assert(policy.calculateConfidence({ ...stable, dataAgeDays: 400 }) > 0, "Keep stale season history, do not discard it");
assert(new GoalkeeperPriceEvidencePolicy().calculateConfidence(stable) < policy.calculateConfidence(stable));
assert.equal(PlayerPriceReviewMath.calculateWeightedMedian([{ value: 1, weight: 1 }, { value: 3, weight: 1 }]), 2);
assert.equal(PlayerPriceReviewMath.calculateWeightedMedian([{ value: 1, weight: 1 }, { value: 3, weight: 3 }]), 3);
assert.equal(PlayerPriceReviewMath.calculateWeightedMedian([]), 0);
function createPeer(id, ratio, count = 10) {
  return { ...stable, count, forecast: ratio * 10, player: { id, price: 10, team: "Автомобилист", position: "нападающий" } };
}
const candidate = createPeer("candidate", 2);
const benchmark = new PlayerPricePeerBenchmark();
const balanced = benchmark.calculateBenchmark(candidate, [createPeer("a", 2), createPeer("b", 2), createPeer("c", 2)], policy);
const noisy = benchmark.calculateBenchmark(candidate, [createPeer("a", 1), createPeer("b", 2), createPeer("c", 3)], policy);
assert.equal(balanced.value, 2);
assert(noisy.reliability < balanced.reliability);
const foreign = { ...createPeer("foreign", 100), player: { ...candidate.player, id: "foreign", team: "МХК Авто" } };
assert.deepEqual(benchmark.calculateBenchmark(candidate, [createPeer("a", 2), createPeer("b", 2), createPeer("c", 2), foreign], policy), balanced);
console.log("Player price review confidence self-test passed");
