import assert from "node:assert/strict";
import { BoundedTaskQueue } from "./BoundedTaskQueue.js";
import { ApiAdmissionPolicy } from "./ApiAdmissionPolicy.js";
import { CachedPriceReviewService } from "./CachedPriceReviewService.js";
import { NonOverlappingPollRunner } from "./NonOverlappingPollRunner.js";

const queue = new BoundedTaskQueue(1, 1); let unblock;
const first = queue.runTask(() => new Promise((resolve) => { unblock = resolve; }));
const second = queue.runTask(async () => "second");
await assert.rejects(queue.runTask(async () => "overflow"), { statusCode: 503 });
await new Promise((resolve) => setImmediate(resolve)); unblock("first");
assert.equal(await first, "first"); assert.equal(await second, "second");
await assert.rejects(queue.runTask(async () => { throw new Error("failed"); }), /failed/);
assert.equal(await queue.runTask(async () => "recovered"), "recovered");
const noWaiting = new BoundedTaskQueue(1, 0); await noWaiting.runTask(async () => 1);
assert.equal(await noWaiting.runTask(async () => 2), 2, "Completed task must release capacity before resolving");
let now = 100; const policy = new ApiAdmissionPolicy({ resolveIdentity: () => "user:1" }, () => now);
for (let index = 0; index < 20; index += 1) policy.admitRequest({ method: "GET" }, "/api/players").release();
assert.equal(policy.admitRequest({ method: "GET" }, "/api/players").statusCode, 429);
for (let index = 0; index < 3; index += 1) { now += 100; assert.equal(policy.admitRequest({ method: "GET" }, "/api/players").statusCode, 429); }
now += 100; policy.admitRequest({ method: "GET" }, "/api/players").release();
now += 60000; policy.admitRequest({ method: "GET" }, "/api/players").release();
const webhooks = Array.from({ length: 4 }, () => policy.admitRequest({ method: "POST" }, "/api/telegram-webhook"));
assert(webhooks.every((entry) => entry.release));
assert.equal(policy.admitRequest({ method: "POST" }, "/api/telegram-webhook").statusCode, 503);
webhooks.forEach((entry) => { entry.release(); entry.release(); }); assert.equal(policy.readStatus().webhook, 0);
let calls = 0; let revision = "one";
const cache = new CachedPriceReviewService({ createReviewReport: async () => ({ version: ++calls }) }, {
  coordinator: { runTask: (task) => task() }, revision: { readRevision: async () => revision }, clock: () => now, ttlMs: 1000 });
assert.deepEqual(await Promise.all([cache.createReviewReport(), cache.createReviewReport()]), [{ version: 1 }, { version: 1 }]);
assert.equal((await cache.createReviewReport()).version, 1);
revision = "two"; assert.equal((await cache.createReviewReport()).version, 2);
assert.equal((await cache.createReviewReport(true)).version, 3);
now += 1001; assert.equal((await cache.createReviewReport()).version, 4);
let endPoll; let polls = 0;
const runner = new NonOverlappingPollRunner(() => { polls += 1; return new Promise((resolve) => { endPoll = resolve; }); }, 100);
const pending = runner.runOnce(); assert.deepEqual(await runner.runOnce(), { skipped: true }); endPoll(); await pending;
assert.equal(polls, 1);
console.log("Operations queues and cache self-test passed");
