import crypto from "node:crypto";
import { KhlMatchDataQueryService } from "./KhlMatchDataQueryService.js";
import { MonthlyPlayerPointsCalculator } from "./MonthlyPlayerPointsCalculator.js";
import { StandingsCalculator } from "./StandingsCalculator.js";
import { TourResultReadinessPolicy } from "./TourResultReadinessPolicy.js";
import { TourResultStateStore } from "./TourResultStateStore.js";
import { OperationalSettings } from "./OperationalSettings.js";
export class TourResultSnapshotService {
  constructor({ rosterRepository, playerCatalogRepository, matchDataRepository, stateStore = new TourResultStateStore(), settleMs = OperationalSettings.readNumber("TOUR_RESULTS_SETTLE_MS", 1800000, 0) }) {
    Object.assign(this, { rosterRepository, playerCatalogRepository, stateStore, settleMs,
      query: new KhlMatchDataQueryService(matchDataRepository), readiness: new TourResultReadinessPolicy(),
      pointsCalculator: new MonthlyPlayerPointsCalculator(), standingsCalculator: new StandingsCalculator() });
  }
  async readFinalResult(tour, calendar, users, now) {
    const saved = await this.stateStore.readTourState(tour.id);
    if (saved?.phase === "final") return saved;
    const database = await this.query.readMonthlyMatchStats(tour.month, calendar);
    const readiness = this.readiness.evaluateReadiness(tour, calendar, database, now);
    if (!readiness.complete) {
      if (saved?.readySince != null) await this.stateStore.writeTourState(tour.id, { phase: "awaiting_data" });
      return { phase: "awaiting_data", missing: readiness.missing };
    }
    const rosters = this.rosterRepository.listRostersByMonth ? await this.rosterRepository.listRostersByMonth(tour.month) : await this.rosterRepository.listRosters();
    const players = await this.playerCatalogRepository.listPlayers();
    const points = this.pointsCalculator.createPlayerPointsMap(players, tour.month, calendar, database);
    const entries = this.standingsCalculator.createMonthlyStandings(rosters, users, points, tour.month, "").entries;
    const fingerprint = crypto.createHash("sha256").update(JSON.stringify(entries.map(({ userId, points, place }) => [userId, points, place]).sort())).digest("hex");
    const readySince = saved?.fingerprint === fingerprint ? saved.readySince : now;
    if (now - readySince < this.settleMs) {
      await this.stateStore.writeTourState(tour.id, { phase: "settling", fingerprint, readySince });
      return { phase: "settling" };
    }
    const usersById = new Map(users.map((user) => [String(user.id), user]));
    const leaders = entries.filter((entry) => entry.place <= 3).map(({ userId, name, place, points }) => {
      const user = usersById.get(String(userId));
      return { userId, name, place, points, phone: user?.phone || "", email: user?.email || "", username: user?.username || "" };
    });
    const result = { phase: "final", tourId: tour.id, title: tour.title || tour.month, month: tour.month, finalizedAt: now, leaders };
    await this.stateStore.writeTourState(tour.id, result);
    return result;
  }
}
