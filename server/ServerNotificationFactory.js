import path from "node:path";
import { CALENDAR_MATCHES, CALENDAR_TOURS } from "../src/data/calendarSeed.js";
import { DraftNotificationDispatcher } from "./DraftNotificationDispatcher.js";
import { DraftNotificationMessageFactory } from "./DraftNotificationMessageFactory.js";
import { DraftNotificationPlanner } from "./DraftNotificationPlanner.js";
import { DraftNotificationWorker } from "./DraftNotificationWorker.js";
import { FantasyCalendarRepository } from "./FantasyCalendarRepository.js";
import { NotificationSentRepository } from "./NotificationSentRepository.js";
import { RosterChangeNotificationService } from "./RosterChangeNotificationService.js";
import { RosterRepository } from "./RosterRepository.js";
import { UserRepository } from "./UserRepository.js";

export class ServerNotificationFactory {
  constructor(rootDirectory, botClient, logger) { Object.assign(this, { rootDirectory, botClient, logger }); }

  createDraftNotificationWorker() {
    const userRepository = new UserRepository(this.#storagePath(process.env.USER_DATABASE_PATH || "storage/users.json"));
    const calendarRepository = new FantasyCalendarRepository(this.#storagePath(process.env.CALENDAR_DATABASE_PATH || "storage/calendar.json"), CALENDAR_TOURS, CALENDAR_MATCHES);
    return new DraftNotificationWorker({ userRepository, calendarRepository, planner: this.#createPlanner(), dispatcher: this.#createDispatcher(), logger: this.logger });
  }

  createRosterChangeNotificationService(userRepository, rosterRepository) {
    return new RosterChangeNotificationService({ userRepository, rosterRepository, dispatcher: this.#createDispatcher(), messageFactory: new DraftNotificationMessageFactory() });
  }

  #createPlanner() {
    const rosterRepository = new RosterRepository(this.#storagePath(process.env.ROSTER_DATABASE_PATH || "storage/rosters.json"));
    return new DraftNotificationPlanner(rosterRepository, new DraftNotificationMessageFactory(), Number(process.env.NOTIFICATION_WINDOW_MS || 3900000));
  }

  #createDispatcher() {
    return new DraftNotificationDispatcher(this.botClient, new NotificationSentRepository(this.#storagePath(process.env.NOTIFICATION_DATABASE_PATH || "storage/notifications.json")), this.logger);
  }

  #storagePath(filePath) { return path.join(this.rootDirectory, filePath); }
}
