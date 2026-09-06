import path from "node:path";
import { CompositeNotificationPlanner } from "./CompositeNotificationPlanner.js";
import { DailyPlayerPointsNotificationPlanner } from "./DailyPlayerPointsNotificationPlanner.js";
import { DraftNotificationDispatcher } from "./DraftNotificationDispatcher.js";
import { DraftNotificationMessageFactory } from "./DraftNotificationMessageFactory.js";
import { DraftNotificationPlanner } from "./DraftNotificationPlanner.js";
import { DraftNotificationWorker } from "./DraftNotificationWorker.js";
import { NotificationSentRepository } from "./NotificationSentRepository.js";
import { NotificationRateLimiter } from "./NotificationRateLimiter.js";
import { RosterChangeNotificationService } from "./RosterChangeNotificationService.js";
import { StorageDriverFactory } from "./StorageDriverFactory.js";

export class ServerNotificationFactory {
  constructor(rootDirectory, botClient, logger) { Object.assign(this, { rootDirectory, botClient, logger }); }

  createDraftNotificationWorker() {
    const storage = this.#createStorageFactory(); const userRepository = storage.createUserRepository();
    const calendarRepository = storage.createCalendarRepository();
    return new DraftNotificationWorker({ userRepository, calendarRepository, planner: this.#createPlanner(), dispatcher: this.#createDispatcher(), logger: this.logger });
  }

  createRosterChangeNotificationService(userRepository, rosterRepository) {
    return new RosterChangeNotificationService({ userRepository, rosterRepository, dispatcher: this.#createDispatcher(), messageFactory: new DraftNotificationMessageFactory() });
  }

  #createPlanner() {
    const storage = this.#createStorageFactory(); const rosterRepository = storage.createRosterRepository();
    const windowMs = Number(process.env.NOTIFICATION_WINDOW_MS || 3900000);
    return new CompositeNotificationPlanner([
      new DraftNotificationPlanner(rosterRepository, new DraftNotificationMessageFactory(), windowMs),
      new DailyPlayerPointsNotificationPlanner({ rosterRepository, matchDataRepository: storage.createMatchDataRepository(),
        playerCatalogRepository: storage.createPlayerCatalogRepository(), windowMs }),
    ]);
  }

  #createDispatcher() {
    const limit = Number(process.env.NOTIFICATION_RATE_LIMIT_PER_SECOND || 20);
    const batchSize = Number(process.env.NOTIFICATION_BATCH_SIZE || 500);
    const storage = this.#createStorageFactory();
    const sentRepository = storage.createNotificationSentRepository() || new NotificationSentRepository(this.#storagePath(process.env.NOTIFICATION_DATABASE_PATH || "storage/notifications.json"));
    return new DraftNotificationDispatcher(this.botClient, sentRepository, this.logger, new NotificationRateLimiter(limit), batchSize);
  }

  #createStorageFactory() { return new StorageDriverFactory(this.#storagePath.bind(this)); }
  #storagePath(filePath) { return path.join(this.rootDirectory, filePath); }
}
