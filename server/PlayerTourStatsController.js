import { PlayerTourStatsCalculator } from "./PlayerTourStatsCalculator.js";

export class PlayerTourStatsController {
  constructor({ jsonResponder, calendarRepository, matchDataRepository, calculator = new PlayerTourStatsCalculator() }) {
    Object.assign(this, { jsonResponder, calendarRepository, matchDataRepository, calculator });
  }

  async handleRequest(request, response, url) {
    if (request.method !== "GET") return this.jsonResponder.sendJson(response, 405, { error: "method_not_allowed" });
    const playerId = url.searchParams.get("playerId");
    const month = url.searchParams.get("month") || "Сентябрь";
    if (!playerId) return this.jsonResponder.sendJson(response, 422, { error: "player_id_required" });
    const [calendar, matchDatabase] = await Promise.all([this.calendarRepository.listCalendar(), this.matchDataRepository.readDatabase()]);
    return this.jsonResponder.sendJson(response, 200, { ok: true, stats: this.calculator.createMonthlyPlayerStats({ playerId, month, calendar, matchDatabase }) });
  }
}
