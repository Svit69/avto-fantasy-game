import path from "node:path";
import { StorageDriverFactory } from "./StorageDriverFactory.js";
import { KhlServiceFactory } from "./KhlServiceFactory.js";
import { TelegramBotClient } from "./TelegramBotClient.js";
import { KhlOnlineAdminNotifier } from "./KhlOnlineAdminNotifier.js";
import { KhlOnlineMatchCollector } from "./KhlOnlineMatchCollector.js";
import { KhlOnlinePollingService } from "./KhlOnlinePollingService.js";
import { OperationalSettings } from "./OperationalSettings.js";

export class KhlOnlineWorkerFactory {
  constructor(root, logger) { Object.assign(this, { root, logger }); }
  createPollingService() {
    const storage = new StorageDriverFactory((file) => path.join(this.root, file));
    const notifier = new KhlOnlineAdminNotifier({ botClient: new TelegramBotClient(process.env.TELEGRAM_BOT_TOKEN, this.logger),
      adminIds: (process.env.TELEGRAM_ADMIN_IDS || "").split(","), notificationRepository: storage.createNotificationSentRepository() });
    const finalDelayMs = OperationalSettings.readNumber("KHL_ONLINE_FINAL_DELAY_MS", 1200000, 300000);
    const collector = new KhlOnlineMatchCollector({ factory: new KhlServiceFactory(this.root), notifier, finalDelayMs });
    const intervalMs = OperationalSettings.readNumber("KHL_ONLINE_POLL_INTERVAL_MS", 300000, 300000);
    return new KhlOnlinePollingService({ calendarRepository: storage.createCalendarRepository(), collector, notifier, logger: this.logger, intervalMs });
  }
}
