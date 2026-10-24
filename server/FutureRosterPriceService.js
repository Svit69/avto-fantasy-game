import { TourSchedulePolicy } from "../src/services/TourSchedulePolicy.js";
import { FutureRosterPricePolicy } from "./FutureRosterPricePolicy.js";
import { ApplicationDataRevision } from "./ApplicationDataRevision.js";
import { RosterPricingCoordinator } from "./RosterPricingCoordinator.js";

export class FutureRosterPriceService {
  constructor({ rosterRepository, playerCatalogRepository, calendarRepository, revision = new ApplicationDataRevision() }) {
    Object.assign(this, { rosterRepository, playerCatalogRepository, calendarRepository, revision });
  }
  async reconcileOpenRosters(calendar = null, now = Date.now()) {
    return new RosterPricingCoordinator().runExclusive(() => this.#reconcileOpenRosters(calendar, now));
  }
  async #reconcileOpenRosters(calendar, now) {
    calendar ||= await this.calendarRepository.listCalendar();
    const tours = new TourSchedulePolicy().buildTourAccessStates(calendar, now)
      .filter((tour) => tour.isOpen && !tour.isLocked && Number.isFinite(tour.deadlineTime) && tour.deadlineTime > now);
    if (!tours.length) return [];
    const players = new Map((await this.playerCatalogRepository.listPlayers()).map((player) => [player.id, player]));
    const updated = [];
    try {
      for (const tour of tours) {
        const rosters = await this.rosterRepository.listRostersByMonth(tour.month);
        const changes = rosters.map((expected) => ({ expected, next: new FutureRosterPricePolicy().repriceRoster(expected, players, now) })).filter((change) => change.next);
        if (changes.length) updated.push(...await this.rosterRepository.replaceRostersIfUnchanged(changes, tour.deadlineTime));
      }
    } finally { if (updated.length) await this.revision.invalidateReports(); }
    return updated;
  }
}
