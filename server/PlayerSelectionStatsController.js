import { PlayerSelectionStatsCalculator } from "./PlayerSelectionStatsCalculator.js";

export class PlayerSelectionStatsController {
  constructor({ jsonResponder, initDataVerifier, rosterRepository, calculator = new PlayerSelectionStatsCalculator() }) {
    Object.assign(this, { jsonResponder, initDataVerifier, rosterRepository, calculator });
  }

  async handleRequest(request, response) {
    if (request.method !== "GET") return this.jsonResponder.sendJson(response, 405, { error: "method_not_allowed" });
    if (!this.#verifyRequestProfile(request.headers["x-telegram-init-data"] || "")) {
      return this.jsonResponder.sendJson(response, 401, { error: "invalid_init_data" });
    }
    const month = new URL(request.url, `http://${request.headers.host}`).searchParams.get("month") || "Сентябрь";
    const stats = this.calculator.createMonthlySelectionStats(await this.rosterRepository.listRosters(), month);
    return this.jsonResponder.sendJson(response, 200, { ok: true, stats });
  }

  #verifyRequestProfile(initData) {
    if (!this.initDataVerifier.hasToken()) return null;
    const params = new URLSearchParams(initData);
    return this.initDataVerifier.verifyInitData(params) ? JSON.parse(params.get("user") || "{}") : null;
  }
}
