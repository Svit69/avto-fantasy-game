import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { EnvironmentFileLoader } from "./EnvironmentFileLoader.js";
import { ServerApplicationFactory } from "./ServerApplicationFactory.js";
import { ServerLogger } from "./ServerLogger.js";
import { PlayerVideoNotificationScheduler } from "./PlayerVideoNotificationScheduler.js";
import { TelegramBotClient } from "./TelegramBotClient.js";
import { TourResultNotificationScheduler } from "./TourResultNotificationScheduler.js";

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
new EnvironmentFileLoader().loadEnvironmentFile(path.join(rootDirectory, ".env"));

const logger = new ServerLogger();
const port = Number(process.env.PORT || 3000);
const application = new ServerApplicationFactory(rootDirectory, logger).createApplication();
const videoScheduler = new PlayerVideoNotificationScheduler({ rootDirectory, logger, botClient: new TelegramBotClient(process.env.TELEGRAM_BOT_TOKEN, logger) });
const resultScheduler = new TourResultNotificationScheduler({ rootDirectory, logger, botClient: new TelegramBotClient(process.env.TELEGRAM_BOT_TOKEN, logger) });
if (!process.env.TELEGRAM_WEBHOOK_SECRET) logger.warn("telegram_webhook_secret_missing", { action: "Configure TELEGRAM_WEBHOOK_SECRET and register webhook with secret_token" });

application.startMonitoring();
const server = http.createServer({ requestTimeout: 120000, headersTimeout: 60000, keepAliveTimeout: 5000 }, (request, response) => application.handleRequest(request, response));
server.on("close", () => { application.stopMonitoring(); videoScheduler.stop(); resultScheduler.stop(); });
server.listen(port, process.env.HOST || undefined, () => {
  videoScheduler.start();
  resultScheduler.start();
  logger.info("server_started", {
    port,
    hasTelegramToken: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    appUrl: process.env.TELEGRAM_WEB_APP_URL || `http://localhost:${port}`,
    hasWebhookUrl: Boolean(process.env.TELEGRAM_WEBHOOK_URL),
  });
});
