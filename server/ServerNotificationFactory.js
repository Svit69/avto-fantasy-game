import path from "node:path";
import { DraftNotificationDispatcher } from "./DraftNotificationDispatcher.js";
import { DraftNotificationMessageFactory } from "./DraftNotificationMessageFactory.js";
import { DraftNotificationWorker } from "./DraftNotificationWorker.js";
import { NotificationPlannerFactory } from "./NotificationPlannerFactory.js";
import { NotificationSentRepository } from "./NotificationSentRepository.js";
import { NotificationRateLimiter } from "./NotificationRateLimiter.js";
import { RosterChangeNotificationService } from "./RosterChangeNotificationService.js";
import { StorageDriverFactory } from "./StorageDriverFactory.js";
import { PlayerVideoNotificationPlanner } from "./PlayerVideoNotificationPlanner.js";
import { RosterPriceWorkerFactory } from "./RosterPriceWorkerFactory.js";
export class ServerNotificationFactory {
  constructor(rootDirectory, botClient, logger) { Object.assign(this, { rootDirectory, botClient, logger }); }

  createDraftNotificationWorker(remindersOnly = false) {
    const storage = this.#createStorageFactory(); const userRepository = storage.createUserRepository();
    const calendarRepository = storage.createCalendarRepository();
    return new DraftNotificationWorker({ userRepository, calendarRepository,
      planner: remindersOnly ? new NotificationPlannerFactory(storage).createReminderPlanner() : new NotificationPlannerFactory(storage).createPlanner(), dispatcher: this.#createDispatcher(), logger: this.logger });
  }

  createRosterChangeNotificationService(userRepository, rosterRepository) {
    return new RosterChangeNotificationService({ userRepository, rosterRepository, dispatcher: this.#createDispatcher(), messageFactory: new DraftNotificationMessageFactory() });
  }
  createRosterPriceNotificationWorker() {
    return new RosterPriceWorkerFactory().createWorker(this.#createStorageFactory(), this.#createDispatcher(), this.logger);
  }
  createPlayerVideoNotificationWorker() {
    const storage = this.#createStorageFactory();
    return new DraftNotificationWorker({ userRepository: storage.createUserRepository(), calendarRepository: storage.createCalendarRepository(),
      planner: new PlayerVideoNotificationPlanner({ rosterRepository: storage.createRosterRepository(), playerCatalogRepository: storage.createPlayerCatalogRepository() }),
      dispatcher: this.#createDispatcher(), logger: this.logger });
  }
  createTourResultNotificationWorker() {
    const storage = this.#createStorageFactory();
    return new DraftNotificationWorker({ userRepository: storage.createUserRepository(), calendarRepository: storage.createCalendarRepository(),
      planner: new NotificationPlannerFactory(storage).createTourResultPlanner(), dispatcher: this.#createDispatcher(), logger: this.logger });
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
