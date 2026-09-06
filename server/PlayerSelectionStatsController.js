import { PlayerSelectionStatsCalculator } from "./PlayerSelectionStatsCalculator.js";

export class PlayerSelectionStatsController {
  constructor({ jsonResponder, profileResolver, rosterRepository, calculator = new PlayerSelectionStatsCalculator() }) {
    Object.assign(this, { jsonResponder, profileResolver, rosterRepository, calculator });
  }

  async handleRequest(request, response) {
    if (request.method !== "GET") return this.jsonResponder.sendJson(response, 405, { error: "method_not_allowed" });
    if (!await this.profileResolver.resolveProfile(request)) {
      return this.jsonResponder.sendJson(response, 401, { error: "invalid_init_data" });
    }
    const month = new URL(request.url, `http://${request.headers.host}`).searchParams.get("month") || "Сентябрь";
    const stats = this.calculator.createMonthlySelectionStats(await this.rosterRepository.listRosters(), month);
    return this.jsonResponder.sendJson(response, 200, { ok: true, stats });
  }
}
