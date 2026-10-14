import path from "node:path";
import { fileURLToPath } from "node:url";
import { EnvironmentFileLoader } from "./EnvironmentFileLoader.js";
import { TelegramBotClient } from "./TelegramBotClient.js";
import { ServerLogger } from "./ServerLogger.js";
import { ExternalAvailabilityProbe } from "./ExternalAvailabilityProbe.js";

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
new EnvironmentFileLoader().loadEnvironmentFile(path.join(rootDirectory, ".env"));
const logger = new ServerLogger();
const result = await new ExternalAvailabilityProbe({ url: process.env.HEALTH_PROBE_URL,
  botClient: new TelegramBotClient(process.env.TELEGRAM_BOT_TOKEN, logger), logger }).probeAvailability();
logger.info("external_availability_checked", result);
process.exitCode = result.ok ? 0 : 1;
