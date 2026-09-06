import { KhlMatchDataQueryService } from "./KhlMatchDataQueryService.js";
import { MonthlyPlayerPointsCalculator } from "./MonthlyPlayerPointsCalculator.js";
import { StandingsCalculator } from "./StandingsCalculator.js";

export class StandingsController {
  constructor({ jsonResponder, profileResolver, userRepository, rosterRepository, playerCatalogRepository, calendarRepository, matchDataRepository, calculator = new StandingsCalculator(), pointsCalculator = new MonthlyPlayerPointsCalculator() }) {
    Object.assign(this, { jsonResponder, profileResolver, userRepository, rosterRepository, playerCatalogRepository,
      calendarRepository, calculator, pointsCalculator, matchDataQueryService: new KhlMatchDataQueryService(matchDataRepository) });
  }

  async handleRequest(request, response) {
    if (request.method !== "GET") return this.jsonResponder.sendJson(response, 405, { error: "method_not_allowed" });
    const profile = await this.profileResolver.resolveProfile(request);
    if (!profile) return this.jsonResponder.sendJson(response, 401, { error: "invalid_init_data" });
    const month = new URL(request.url, `http://${request.headers.host}`).searchParams.get("month") || "Сентябрь";
    const [users, rosters, players, calendar] = await Promise.all([
      this.userRepository.listUsers(), this.#listRosters(month), this.playerCatalogRepository.listPlayers(), this.calendarRepository.listCalendar(),
    ]);
    const matchDatabase = await this.matchDataQueryService.readMonthlyMatchStats(month, calendar);
    const playerPoints = this.pointsCalculator.createPlayerPointsMap(players, month, calendar, matchDatabase);
    const standings = this.calculator.createMonthlyStandings(rosters, users, playerPoints, month, profile.id);
    return this.jsonResponder.sendJson(response, 200, { ok: true, standings });
  }

  #listRosters(month) {
    return this.rosterRepository.listRostersByMonth ? this.rosterRepository.listRostersByMonth(month) : this.rosterRepository.listRosters();
  }
}
