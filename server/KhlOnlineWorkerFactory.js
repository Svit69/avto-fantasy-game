import path from "node:path";
import { StorageDriverFactory } from "./StorageDriverFactory.js";
import { KhlServiceFactory } from "./KhlServiceFactory.js";
import { TelegramBotClient } from "./TelegramBotClient.js";
import { KhlOnlineAdminNotifier } from "./KhlOnlineAdminNotifier.js";
import { KhlOnlineMatchCollector } from "./KhlOnlineMatchCollector.js";
import { KhlOnlinePollingService } from "./KhlOnlinePollingService.js";
import { OperationalSettings } from "./OperationalSettings.js";
import { OnlineHockeyLeagueConfiguration } from "./OnlineHockeyLeagueConfiguration.js";
import { KhlMirrorDataProvider } from "./KhlMirrorDataProvider.js";

export class KhlOnlineWorkerFactory {
  constructor(root, logger, configuration = OnlineHockeyLeagueConfiguration.khl()) { Object.assign(this, { root, logger, configuration }); }
  createDataProvider(options) { return new KhlMirrorDataProvider(options); }
  createPollingService() {
    const storage = new StorageDriverFactory((file) => path.join(this.root, file));
    const configuration = this.configuration; const prefix = configuration.key.toUpperCase();
    const notifier = new KhlOnlineAdminNotifier({ botClient: new TelegramBotClient(process.env.TELEGRAM_BOT_TOKEN, this.logger),
      adminIds: (process.env.TELEGRAM_ADMIN_IDS || "").split(","), notificationRepository: storage.createNotificationSentRepository(), configuration });
    const finalDelayMs = OperationalSettings.readNumber(`${prefix}_ONLINE_FINAL_DELAY_MS`, 1200000, 300000);
    const collector = new KhlOnlineMatchCollector({ factory: new KhlServiceFactory(this.root), notifier, finalDelayMs, configuration, providerFactory: (options) => this.createDataProvider(options) });
    const intervalMs = OperationalSettings.readNumber(`${prefix}_ONLINE_POLL_INTERVAL_MS`, 300000, 300000);
    return new KhlOnlinePollingService({ calendarRepository: storage.createCalendarRepository(), collector, notifier, logger: this.logger, intervalMs, configuration });
  }
}
