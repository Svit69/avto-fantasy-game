import { KhlMatchDataQueryService } from "./KhlMatchDataQueryService.js";
import { MonthlyPlayerPointsCalculator } from "./MonthlyPlayerPointsCalculator.js";
import { StandingsCalculator } from "./StandingsCalculator.js";
import { RevisionedReportCache } from "./RevisionedReportCache.js";
import crypto from "node:crypto";

export class MonthlyStandingsReportService {
  constructor({ userRepository, rosterRepository, playerCatalogRepository, calendarRepository, matchDataRepository,
    calculator = new StandingsCalculator(), pointsCalculator = new MonthlyPlayerPointsCalculator(), cache = new RevisionedReportCache() }) {
    Object.assign(this, { userRepository, rosterRepository, playerCatalogRepository, calendarRepository, calculator, pointsCalculator, cache,
      query: new KhlMatchDataQueryService(matchDataRepository), builds: 0 });
  }
  loadMonthlyReport(month) { return this.cache.loadReport(month, () => this.#createReport(month)); }
  async #createReport(month) {
    this.builds += 1;
    const [users, rosters, players, calendar] = await Promise.all([this.userRepository.listUsers(),
      this.rosterRepository.listRostersByMonth ? this.rosterRepository.listRostersByMonth(month) : this.rosterRepository.listRosters(),
      this.playerCatalogRepository.listPlayers(), this.calendarRepository.listCalendar()]);
    const database = await this.query.readMonthlyMatchStats(month, calendar);
    const points = this.pointsCalculator.createPlayerPointsMap(players, month, calendar, database);
    const report = this.calculator.createMonthlyStandings(rosters, users, points, month, "");
    return { ...report, version: crypto.createHash("sha256").update(JSON.stringify(report)).digest("hex") };
  }
}
