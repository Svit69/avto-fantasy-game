import assert from "node:assert/strict";
import { OperationalAlertPolicy } from "./OperationalAlertPolicy.js";
import { OperationalAlertDispatcher } from "./OperationalAlertDispatcher.js";
import { ApiWorkMetrics } from "./ApiWorkMetrics.js";
import { LinuxResourceParser } from "./LinuxResourceParser.js";

const oldLimit = process.env.MONITOR_API_P95_WARN_MS; delete process.env.MONITOR_API_P95_WARN_MS;
try {
  const sample = { availableMemoryBytes: 200 * 1048576, cpuPercent: 10, freeDiskPercent: 30, eventLoopP95Ms: 20, time: 1000 };
  const api = { count: 100, serverWorkP95Ms: 999999, serverErrorRate: 0 };
  const policy = new OperationalAlertPolicy();
  assert.equal(policy.evaluateConditions(sample, api, null, 0).find((item) => item.key === "api_slow").active, false);
  process.env.MONITOR_API_P95_WARN_MS = "5000";
  const warning = policy.evaluateConditions(sample, api, null, 0).find((item) => item.key === "api_slow");
  assert(warning.active && warning.holdMs === 180000);
  const messages = []; const dispatcher = new OperationalAlertDispatcher({ hasToken: () => true, callJson: async (_method, message) => { messages.push(message); return { ok: true }; } }, { warn: () => {} }, ["1"]);
  const condition = { key: "test", active: true, holdMs: 1000, text: "Проверка" };
  await dispatcher.dispatchAlerts([condition], 0); await dispatcher.dispatchAlerts([condition], 1000);
  await dispatcher.dispatchAlerts([condition], 2000); assert.equal(messages.length, 1);
  await dispatcher.dispatchAlerts([{ ...condition, active: false }], 3000);
  await dispatcher.dispatchAlerts([{ ...condition, active: false }], 64000); assert.equal(messages.length, 2);
  const metrics = new ApiWorkMetrics();
  const response = { statusCode: 200, end: () => new Promise((resolve) => setTimeout(resolve, 50)) };
  metrics.measureRequest({ method: "GET" }, response, "/api/players");
  const sent = response.end(); const measured = metrics.readSnapshot().serverWorkP95Ms;
  await sent; assert.equal(metrics.readSnapshot().serverWorkP95Ms, measured, "Socket send delay must not affect server-work metric");
  for (let index = 0; index < 1100; index += 1) metrics.recordSample(index, 200);
  assert.equal(metrics.readSnapshot().count, 1000);
  const parser = new LinuxResourceParser();
  assert.equal(parser.parseMemory("MemAvailable: 100 kB\nMemTotal: 200 kB\nSwapTotal: 50 kB\nSwapFree: 20 kB").availableMemoryBytes, 102400);
  assert.equal(parser.parseSwapActivity("pswpin 10\npswpout 20\npgfault 100"), 30);
} finally { if (oldLimit === undefined) delete process.env.MONITOR_API_P95_WARN_MS; else process.env.MONITOR_API_P95_WARN_MS = oldLimit; }
console.log("Operations monitoring and network-delay isolation self-test passed");
