import { AuthorizedTelegramAppUrlFactory } from "./AuthorizedTelegramAppUrlFactory.js";
import { CompositeNotificationPlanner } from "./CompositeNotificationPlanner.js";
import { DailyPlayerPointsNotificationPlanner } from "./DailyPlayerPointsNotificationPlanner.js";
import { DraftNotificationMessageFactory } from "./DraftNotificationMessageFactory.js";
import { DraftNotificationPlanner } from "./DraftNotificationPlanner.js";
import { TourAvailabilityMessageFactory } from "./TourAvailabilityMessageFactory.js";
import { TourAvailabilityNotificationPlanner } from "./TourAvailabilityNotificationPlanner.js";
import { WebLoginTokenService } from "./WebLoginTokenService.js";

export class NotificationPlannerFactory {
  constructor(storage) { this.storage = storage; }

  createPlanner() {
    const rosterRepository = this.storage.createRosterRepository();
    const windowMs = Number(process.env.NOTIFICATION_WINDOW_MS || 3900000);
    return new CompositeNotificationPlanner([
      new DraftNotificationPlanner(rosterRepository, new DraftNotificationMessageFactory(), windowMs),
      this.#createTourAvailabilityPlanner(windowMs),
      new DailyPlayerPointsNotificationPlanner({ rosterRepository, windowMs,
        matchDataRepository: this.storage.createMatchDataRepository(),
        playerCatalogRepository: this.storage.createPlayerCatalogRepository() }),
    ]);
  }

  #createTourAvailabilityPlanner(windowMs) {
    return new TourAvailabilityNotificationPlanner({ windowMs,
      messageFactory: new TourAvailabilityMessageFactory(),
      appUrlFactory: new AuthorizedTelegramAppUrlFactory(new WebLoginTokenService(process.env.TELEGRAM_BOT_TOKEN)),
      appUrl: process.env.TELEGRAM_WEB_APP_URL || "http://localhost:3000" });
  }
}
