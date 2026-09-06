import { DailyDigestTimePolicy } from "./DailyDigestTimePolicy.js";
import { DailyPlayerPointsDigestBuilder } from "./DailyPlayerPointsDigestBuilder.js";
import { DailyPlayerPointsMatchSelector } from "./DailyPlayerPointsMatchSelector.js";
import { DailyPlayerPointsMessageFactory } from "./DailyPlayerPointsMessageFactory.js";

export class DailyPlayerPointsNotificationPlanner {
  constructor({ rosterRepository, matchDataRepository, playerCatalogRepository, windowMs }) {
    Object.assign(this, { rosterRepository, matchDataRepository, playerCatalogRepository,
      timePolicy: new DailyDigestTimePolicy(9, windowMs), matchSelector: new DailyPlayerPointsMatchSelector(),
      digestBuilder: new DailyPlayerPointsDigestBuilder(new DailyPlayerPointsMessageFactory()) });
  }

  async createNotificationJobs(calendar, users, now = Date.now()) {
    const dueWindow = this.timePolicy.createDueWindow(now);
    if (!dueWindow) return [];
    const [rosters, matchDatabase, players] = await Promise.all([
      this.rosterRepository.listRosters(), this.matchDataRepository.readDatabase(), this.playerCatalogRepository.listPlayers(),
    ]);
    const summaries = this.matchSelector.selectMatches(calendar, matchDatabase, dueWindow.matchDate);
    return this.#activeUsers(users).map((user) => this.digestBuilder.createUserJob(user, rosters, summaries,
      this.#mapPlayersById(players), dueWindow.notificationDate, dueWindow.matchDate)).filter(Boolean);
  }

  #activeUsers(users) { return users.filter((user) => user.status !== "blocked"); }
  #mapPlayersById(players) { return new Map(players.map((player) => [player.id, player])); }
}
