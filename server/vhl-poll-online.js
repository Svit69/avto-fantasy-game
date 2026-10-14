import path from "node:path";
import { fileURLToPath } from "node:url";
import { CalendarStorageFactory } from "./CalendarStorageFactory.js";
import { EnvironmentFileLoader } from "./EnvironmentFileLoader.js";
import { KhlServiceFactory } from "./KhlServiceFactory.js";
import { ServerLogger } from "./ServerLogger.js";
import { StorageDriverFactory } from "./StorageDriverFactory.js";
import { TelegramBotClient } from "./TelegramBotClient.js";
import { VhlOnlineAdminNotifier } from "./VhlOnlineAdminNotifier.js";
import { VhlOnlineActiveMatchSelector } from "./VhlOnlineActiveMatchSelector.js";
import { VhlOnlinePollingService } from "./VhlOnlinePollingService.js";
import { NonOverlappingPollRunner } from "./NonOverlappingPollRunner.js";
import { WorkerHeartbeat } from "./WorkerHeartbeat.js";
import { OperationalSettings } from "./OperationalSettings.js";

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
new EnvironmentFileLoader().loadEnvironmentFile(path.join(rootDirectory, ".env"));
const logger = new ServerLogger();
const storage = new CalendarStorageFactory((filePath) => path.join(rootDirectory, filePath));
const driverFactory = new StorageDriverFactory((filePath) => path.join(rootDirectory, filePath));
const adminNotifier = new VhlOnlineAdminNotifier({ botClient: new TelegramBotClient(process.env.TELEGRAM_BOT_TOKEN, logger),
  adminIds: (process.env.TELEGRAM_ADMIN_IDS || "").split(","), notificationRepository: driverFactory.createNotificationSentRepository(), logger });
const service = new VhlOnlinePollingService({ calendarRepository: storage.createCalendarRepository(),
  khlServiceFactory: new KhlServiceFactory(rootDirectory), selector: new VhlOnlineActiveMatchSelector(), logger, adminNotifier });
const pollIntervalMs = OperationalSettings.readNumber("VHL_ONLINE_POLL_INTERVAL_MS", 120000, 10000);
const runner = new NonOverlappingPollRunner(() => new WorkerHeartbeat().recordCycle(() => service.pollActiveMatches()), pollIntervalMs,
  (error) => logger.error("vhl_online_poll_failed", { errorMessage: error.message }));
let initialFailed = false;
try { initialFailed = (await runner.runOnce()).some((result) => result.ok === false); }
catch (error) { initialFailed = true; logger.error("vhl_online_poll_failed", { errorMessage: error.message }); }
if (process.argv.includes("--once")) process.exit(initialFailed ? 1 : 0);
runner.start();
