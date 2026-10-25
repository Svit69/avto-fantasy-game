import { RevisionedReportCache } from "./RevisionedReportCache.js";
import { PlayerPriceReviewContextResolver } from "./PlayerPriceReviewContextResolver.js";
import { PlayerPriceReviewDataSource } from "./PlayerPriceReviewDataSource.js";
import { PlayerPricePerformanceCalculator } from "./PlayerPricePerformanceCalculator.js";
import { AutoRosterTourPolicy } from "./AutoRosterTourPolicy.js";

export class AutoRosterCandidateService {
  constructor({ playerCatalogRepository, matchDataRepository, cache = new RevisionedReportCache({ ttlMs: 60000 }) }) {
    Object.assign(this, { playerCatalogRepository, matchDataRepository, cache });
  }
  loadCandidates(calendar, tour) {
    return this.cache.loadReport(tour.id, async () => {
      const context = new PlayerPriceReviewContextResolver().resolveContext(calendar);
      const data = await new PlayerPriceReviewDataSource(this.matchDataRepository).readReviewData(context);
      const players = new AutoRosterTourPolicy().findEligiblePlayers(await this.playerCatalogRepository.listPlayers(), calendar, tour);
      const calculator = new PlayerPricePerformanceCalculator();
      return players.map((player) => ({ ...player, autoScore: calculator.calculatePerformance(player, context, data).forecast }));
    });
  }
}
