import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { EnvironmentFileLoader } from "./EnvironmentFileLoader.js";
import { ServerApplicationFactory } from "./ServerApplicationFactory.js";
import { ServerLogger } from "./ServerLogger.js";

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
new EnvironmentFileLoader().loadEnvironmentFile(path.join(rootDirectory, ".env"));

const logger = new ServerLogger();
const port = Number(process.env.PORT || 3000);
const application = new ServerApplicationFactory(rootDirectory, logger).createApplication();

http.createServer((request, response) => application.handleRequest(request, response)).listen(port, () => {
  logger.info("server_started", {
    port,
    hasTelegramToken: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    appUrl: process.env.TELEGRAM_WEB_APP_URL || `http://localhost:${port}`,
    hasWebhookUrl: Boolean(process.env.TELEGRAM_WEBHOOK_URL),
  });
});
