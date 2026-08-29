import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { EnvironmentFileLoader } from "./EnvironmentFileLoader.js";
import { HttpApplication } from "./HttpApplication.js";
import { JsonResponder } from "./JsonResponder.js";
import { RequestBodyParser } from "./RequestBodyParser.js";
import { ServerLogger } from "./ServerLogger.js";
import { StaticFileServer } from "./StaticFileServer.js";
import { TelegramAuthController } from "./TelegramAuthController.js";
import { TelegramBotClient } from "./TelegramBotClient.js";
import { TelegramInitDataVerifier } from "./TelegramInitDataVerifier.js";
import { TelegramUserMapper } from "./TelegramUserMapper.js";
import { TelegramWebhookController } from "./TelegramWebhookController.js";
import { TelegramWebhookInstaller } from "./TelegramWebhookInstaller.js";
import { TelegramWebhookInfoController } from "./TelegramWebhookInfoController.js";
import { TelegramUpdateSummarizer } from "./TelegramUpdateSummarizer.js";
import { UserRepository } from "./UserRepository.js";

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
new EnvironmentFileLoader().loadEnvironmentFile(path.join(rootDirectory, ".env"));

const logger = new ServerLogger();
const bodyParser = new RequestBodyParser();
const jsonResponder = new JsonResponder();
const botClient = new TelegramBotClient(process.env.TELEGRAM_BOT_TOKEN, logger);
const port = Number(process.env.PORT || 3000);
const appUrl = process.env.TELEGRAM_WEB_APP_URL || `http://localhost:${port}`;
const userMapper = new TelegramUserMapper();
const userRepository = new UserRepository(path.join(rootDirectory, process.env.USER_DATABASE_PATH || "storage/users.json"));
const application = new HttpApplication({
  jsonResponder,
  staticFileServer: new StaticFileServer(rootDirectory),
  authController: new TelegramAuthController({ bodyParser, jsonResponder, initDataVerifier: new TelegramInitDataVerifier(process.env.TELEGRAM_BOT_TOKEN), userMapper, userRepository }),
  webhookController: new TelegramWebhookController({
    bodyParser, jsonResponder, botClient, appUrl, userMapper, userRepository,
    logger, summarizer: new TelegramUpdateSummarizer(),
  }),
  webhookInstaller: new TelegramWebhookInstaller({ jsonResponder, botClient, webhookUrl: process.env.TELEGRAM_WEBHOOK_URL, logger }),
  webhookInfo: new TelegramWebhookInfoController({ jsonResponder, botClient }),
});

http.createServer((request, response) => application.handleRequest(request, response)).listen(port, () => {
  logger.info("server_started", { port, hasTelegramToken: botClient.hasToken(), appUrl, hasWebhookUrl: Boolean(process.env.TELEGRAM_WEBHOOK_URL) });
});
