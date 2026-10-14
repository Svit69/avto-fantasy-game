import { KhlMatchDataQueryService } from "./KhlMatchDataQueryService.js";
import { PlayerTourStatsCollectionCalculator } from "./PlayerTourStatsCollectionCalculator.js";
import { PlayerTourStatsCalculator } from "./PlayerTourStatsCalculator.js";
import { SeasonPlayerStatsService } from "./SeasonPlayerStatsService.js";

export class PlayerTourStatsController {
  constructor({ jsonResponder, calendarRepository, matchDataRepository, calculator = new PlayerTourStatsCalculator(), collectionCalculator = new PlayerTourStatsCollectionCalculator(calculator) }) {
    Object.assign(this, { jsonResponder, calendarRepository, calculator, collectionCalculator,
      matchDataQueryService: new KhlMatchDataQueryService(matchDataRepository), seasonStatsService: new SeasonPlayerStatsService(matchDataRepository) });
  }

  async handleRequest(request, response, url) {
    if (request.method !== "GET") return this.jsonResponder.sendJson(response, 405, { error: "method_not_allowed" });
    const playerId = url.searchParams.get("playerId");
    const month = url.searchParams.get("month") || "Сентябрь";
    const calendar = await this.calendarRepository.listCalendar();
    if (url.searchParams.get("scope") === "season") {
      const stats = await this.seasonStatsService.createSeasonPlayerStats(calendar);
      return this.jsonResponder.sendJson(response, 200, { ok: true, stats });
    }
    const matchDatabase = await this.matchDataQueryService.readMonthlyMatchStats(month, calendar);
    if (!playerId) return this.#sendStatsCollection(response, month, calendar, matchDatabase);
    const stats = this.calculator.createMonthlyPlayerStats({ playerId, month, calendar, matchDatabase });
    return this.jsonResponder.sendJson(response, 200, { ok: true, stats });
  }

  #sendStatsCollection(response, month, calendar, matchDatabase) {
    const stats = this.collectionCalculator.createMonthlyPlayerStatsCollection({ month, calendar, matchDatabase });
    return this.jsonResponder.sendJson(response, 200, { ok: true, stats });
  }
}
