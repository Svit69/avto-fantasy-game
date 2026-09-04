import { StandingsCalculator } from "./StandingsCalculator.js";
import { MonthlyPlayerPointsCalculator } from "./MonthlyPlayerPointsCalculator.js";

export class StandingsController {
  constructor({ jsonResponder, initDataVerifier, userRepository, rosterRepository, playerCatalogRepository, calendarRepository, matchDataRepository, calculator = new StandingsCalculator(), pointsCalculator = new MonthlyPlayerPointsCalculator() }) {
    Object.assign(this, { jsonResponder, initDataVerifier, userRepository, rosterRepository, playerCatalogRepository, calendarRepository, matchDataRepository, calculator, pointsCalculator });
  }

  async handleRequest(request, response) {
    if (request.method !== "GET") return this.jsonResponder.sendJson(response, 405, { error: "method_not_allowed" });
    const profile = this.#verifyRequestProfile(request.headers["x-telegram-init-data"] || "");
    if (!profile) return this.jsonResponder.sendJson(response, 401, { error: "invalid_init_data" });
    const month = new URL(request.url, `http://${request.headers.host}`).searchParams.get("month") || "Сентябрь";
    const [users, rosters, players, calendar, matchDatabase] = await Promise.all([
      this.userRepository.listUsers(), this.rosterRepository.listRosters(), this.playerCatalogRepository.listPlayers(), this.calendarRepository.listCalendar(), this.matchDataRepository.readDatabase(),
    ]);
    const playerPoints = this.pointsCalculator.createPlayerPointsMap(players, month, calendar, matchDatabase);
    const standings = this.calculator.createMonthlyStandings(rosters, users, playerPoints, month, profile.id);
    return this.jsonResponder.sendJson(response, 200, { ok: true, standings });
  }

  #verifyRequestProfile(initData) {
    if (!this.initDataVerifier.hasToken()) return null;
    const params = new URLSearchParams(initData);
    return this.initDataVerifier.verifyInitData(params) ? JSON.parse(params.get("user") || "{}") : null;
  }
}
