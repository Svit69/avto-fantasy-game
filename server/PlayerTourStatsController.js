import { KhlMatchDataQueryService } from "./KhlMatchDataQueryService.js";
import { PlayerTourStatsCollectionCalculator } from "./PlayerTourStatsCollectionCalculator.js";
import { PlayerTourStatsCalculator } from "./PlayerTourStatsCalculator.js";

export class PlayerTourStatsController {
  constructor({ jsonResponder, calendarRepository, matchDataRepository, calculator = new PlayerTourStatsCalculator(), collectionCalculator = new PlayerTourStatsCollectionCalculator(calculator) }) {
    Object.assign(this, { jsonResponder, calendarRepository, calculator, collectionCalculator,
      matchDataQueryService: new KhlMatchDataQueryService(matchDataRepository) });
  }

  async handleRequest(request, response, url) {
    if (request.method !== "GET") return this.jsonResponder.sendJson(response, 405, { error: "method_not_allowed" });
    const playerId = url.searchParams.get("playerId");
    const month = url.searchParams.get("month") || "Сентябрь";
    const calendar = await this.calendarRepository.listCalendar();
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
