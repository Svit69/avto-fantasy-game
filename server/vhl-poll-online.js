import path from "node:path";
import { fileURLToPath } from "node:url";
import { CalendarStorageFactory } from "./CalendarStorageFactory.js";
import { EnvironmentFileLoader } from "./EnvironmentFileLoader.js";
import { KhlServiceFactory } from "./KhlServiceFactory.js";
import { ServerLogger } from "./ServerLogger.js";
import { VhlOnlineActiveMatchSelector } from "./VhlOnlineActiveMatchSelector.js";
import { VhlOnlinePollingService } from "./VhlOnlinePollingService.js";

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
new EnvironmentFileLoader().loadEnvironmentFile(path.join(rootDirectory, ".env"));
const logger = new ServerLogger();
const storage = new CalendarStorageFactory((filePath) => path.join(rootDirectory, filePath));
const service = new VhlOnlinePollingService({ calendarRepository: storage.createCalendarRepository(),
  khlServiceFactory: new KhlServiceFactory(rootDirectory), selector: new VhlOnlineActiveMatchSelector(), logger });
const pollIntervalMs = Number(process.env.VHL_ONLINE_POLL_INTERVAL_MS || 120000);
await service.pollActiveMatches();
if (process.argv.includes("--once")) process.exit(0);
setInterval(() => service.pollActiveMatches().catch((error) => logger.error("vhl_online_poll_failed", { errorMessage: error.message })), pollIntervalMs);
