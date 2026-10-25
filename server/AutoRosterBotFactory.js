import { AutoRosterBotController } from "./AutoRosterBotController.js";
import { AutoRosterSubmissionService } from "./AutoRosterSubmissionService.js";

export class AutoRosterBotFactory {
  createController({ botClient, logger, userRepository, rosterRepository, playerCatalogRepository, calendarRepository, khlMatchDataRepository }) {
    return new AutoRosterBotController({ botClient, logger, service: new AutoRosterSubmissionService({ userRepository,
      rosterRepository, playerCatalogRepository, calendarRepository, matchDataRepository: khlMatchDataRepository }) });
  }
}
