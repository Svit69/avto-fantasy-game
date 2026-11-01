import { VhlOnlineDataProvider } from "./VhlOnlineDataProvider.js";
import { VhlFinalDataProvider } from "./VhlFinalDataProvider.js";
import { VhlMatchReviewPollingCoordinator } from "./VhlMatchReviewPollingCoordinator.js";

export class VhlOnlinePollingService {
  constructor({ calendarRepository, khlServiceFactory, selector, logger, adminNotifier = null, reviewCoordinator = new VhlMatchReviewPollingCoordinator() }) {
    Object.assign(this, { calendarRepository, khlServiceFactory, selector, logger, adminNotifier, reviewCoordinator });
  }

  async pollActiveMatches() {
    const calendar = await this.calendarRepository.listCalendar();
    const matches = await this.reviewCoordinator.findPollableMatches(calendar, this.selector);
    const results = [];
    for (const match of matches) {
      try { results.push(await this.#ingestMatch(match)); }
      catch (error) {
        this.logger.warn("vhl_online_match_skipped", { matchId: match.id, onlineGameId: match.onlineGameId, errorMessage: error.message,
          sourceIdentity: error.sourceMatch ? { homeTeam: error.sourceMatch.homeTeam, awayTeam: error.sourceMatch.awayTeam, scheduledAt: error.sourceMatch.scheduledAt } : undefined });
        const review = error.message === "vhl_match_identity_mismatch" && await this.adminNotifier?.notifyProtocolMismatch(match, error.sourceMatch);
        if (["vhl_online_game_not_found", "vhl_online_http_404"].includes(error.message)) await this.adminNotifier?.notifyProtocolUnavailable(match);
        results.push({ ok: ["pending", "rejected"].includes(review?.status) ? null : false, reason: error.message, matchId: match.id, reviewStatus: review?.status });
      }
    }
    this.logger.info("vhl_online_poll_finished", { matches: results.length });
    return results;
  }

  async #ingestMatch(match) {
    const players = await this.khlServiceFactory.createPlayerCatalogRepository().listPlayers();
    const provider = this.#createDataProvider(match, players);
    await provider.getMatch();
    await this.adminNotifier?.notifyMatchStarted(match);
    const result = await this.khlServiceFactory.createIngestionService(provider).ingestMatch(match.tourId, match.onlineGameId);
    await this.adminNotifier?.notifyInterimResultCollected(match, result);
    await this.adminNotifier?.notifyFinalDataCollected(match, result);
    if (result.ok && result.match?.status === "finished") await this.reviewCoordinator.markCollected(match);
    this.logger.info("vhl_online_match_ingested", { matchId: match.id, onlineGameId: match.onlineGameId, ok: result.ok });
    return result;
  }

  #createDataProvider(match, players) {
    const identity = { tournamentId: match.tourId, scheduledAt: match.startsAt, expectedMatch: match };
    if (match.isLivePollingWindow) return new VhlOnlineDataProvider({ onlineGameId: match.onlineGameId, players, identity });
    return new VhlFinalDataProvider({ onlineGameId: match.onlineGameId, players, identity, logger: this.logger });
  }
}
