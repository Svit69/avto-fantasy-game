import { HeavyTaskCoordinator } from "./HeavyTaskCoordinator.js";
import { ApplicationDataRevision } from "./ApplicationDataRevision.js";

export class LimitedMatchIngestionService {
  constructor(service, coordinator = HeavyTaskCoordinator.getShared()) { Object.assign(this, { service, coordinator }); }
  ingestMatch(tournamentId, gameId) {
    return this.coordinator.runTask(async () => {
      try { return await this.service.ingestMatch(tournamentId, gameId); }
      finally { await new ApplicationDataRevision().invalidateReports(); }
    });
  }
}
