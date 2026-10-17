import path from "node:path";
import { fileURLToPath } from "node:url";
import { EnvironmentFileLoader } from "./EnvironmentFileLoader.js";
import { ServerLogger } from "./ServerLogger.js";
import { MhlOnlineWorkerFactory } from "./MhlOnlineWorkerFactory.js";
import { NonOverlappingPollRunner } from "./NonOverlappingPollRunner.js";
import { WorkerHeartbeat } from "./WorkerHeartbeat.js";
import { RuntimeStateStore } from "./RuntimeStateStore.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
new EnvironmentFileLoader().loadEnvironmentFile(path.join(root, ".env"));
const logger = new ServerLogger();
const service = new MhlOnlineWorkerFactory(root, logger).createPollingService();
const heartbeat = new WorkerHeartbeat(new RuntimeStateStore(), "mhl-heartbeat.json");
const runner = new NonOverlappingPollRunner(() => heartbeat.recordCycle(() => service.pollActiveMatches()), service.intervalMs,
  (error) => logger.error("mhl_online_poll_failed", { errorMessage: error.message }));
let failed = false;
try { failed = (await runner.runOnce()).some((result) => !result.ok); }
catch (error) { failed = true; logger.error("mhl_online_poll_failed", { errorMessage: error.message }); }
if (process.argv.includes("--once")) process.exit(failed ? 1 : 0);
runner.start();
