import { RosterPriceNotificationPlanner } from "./RosterPriceNotificationPlanner.js";
import { DraftNotificationWorker } from "./DraftNotificationWorker.js";

export class RosterPriceWorkerFactory {
  createWorker(storage, dispatcher, logger) {
    const calendarRepository = storage.createCalendarRepository();
    return new DraftNotificationWorker({ userRepository: storage.createUserRepository(), calendarRepository,
      planner: new RosterPriceNotificationPlanner({ rosterRepository: storage.createRosterRepository(), calendarRepository,
        playerCatalogRepository: storage.createPlayerCatalogRepository() }), dispatcher, logger });
  }
}
