import path from "node:path";
import { fileURLToPath } from "node:url";
import { EnvironmentFileLoader } from "./EnvironmentFileLoader.js";
import { ServerLogger } from "./ServerLogger.js";
import { ServerNotificationFactory } from "./ServerNotificationFactory.js";
import { TelegramBotClient } from "./TelegramBotClient.js";

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
new EnvironmentFileLoader().loadEnvironmentFile(path.join(rootDirectory, ".env"));

const logger = new ServerLogger();
const botClient = new TelegramBotClient(process.env.TELEGRAM_BOT_TOKEN, logger, Number(process.env.TELEGRAM_API_TIMEOUT_MS || 15000));

if (!botClient.hasToken()) {
  logger.warn("draft_notification_worker_skipped", { reason: "telegram_token_missing" });
  process.exit(0);
}

new ServerNotificationFactory(rootDirectory, botClient, logger).createDraftNotificationWorker()
  .processDueNotifications().catch((error) => {
    logger.error("draft_notification_worker_failed", { errorMessage: error.message, stack: error.stack });
    process.exit(1);
  });
