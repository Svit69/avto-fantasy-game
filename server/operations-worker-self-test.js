import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { TelegramUpdateGate } from "./TelegramUpdateGate.js";
import { RuntimeStateStore } from "./RuntimeStateStore.js";
import { WorkerHeartbeat } from "./WorkerHeartbeat.js";
import { createOperationsTestWorkspace } from "./operations-test-workspace.js";

const workspace = await createOperationsTestWorkspace();
try {
  const store = new RuntimeStateStore(workspace.directory); const gate = new TelegramUpdateGate(store); let calls = 0;
  const update = { update_id: 10, message: { chat: { id: 1 } } };
  const task = async () => { calls += 1; return { method: "sendMessage", text: "Готово" }; };
  const replies = await Promise.all([gate.runUpdate(update, task), gate.runUpdate(update, task)]);
  assert.equal(calls, 1); assert.deepEqual(replies[0], replies[1]);
  await new TelegramUpdateGate(store).runUpdate(update, task); assert.equal(calls, 1, "Completed update must survive controller restart");
  await assert.rejects(gate.runUpdate({ update_id: 11 }, async () => { throw new Error("retry"); }), /retry/);
  await gate.runUpdate({ update_id: 11 }, task); assert.equal(calls, 2);
  const heartbeat = new WorkerHeartbeat(store);
  await heartbeat.recordCycle(async () => [{ ok: true }, { ok: false }]);
  assert.equal((await store.readState("vhl-heartbeat.json")).failedMatches, 1);
  await assert.rejects(heartbeat.recordCycle(async () => { throw new Error("offline"); }), /offline/);
  await heartbeat.recordCycle(async () => []); assert.equal((await store.readState("vhl-heartbeat.json")).failedAt, undefined);
  const execute = promisify(execFile);
  await Promise.all([1, 2].map(() => execute(process.execPath, ["server/operations-lock-test-child.js", workspace.directory], { timeout: 15000 })));
  const events = (await fs.readFile(path.join(workspace.directory, "events.txt"), "utf8")).trim().split("\n");
  assert.equal(events.length, 4); assert(events[0].endsWith(":start") && events[1].endsWith(":end"));
  assert.equal(events[0].split(":")[0], events[1].split(":")[0]);
  assert.equal(events[2].split(":")[0], events[3].split(":")[0]);
} finally { await workspace.close(); }
console.log("Operations webhook receipts, worker heartbeat and cross-process lock self-test passed");
