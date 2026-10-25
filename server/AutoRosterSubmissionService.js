import { AutoRosterTourPolicy } from "./AutoRosterTourPolicy.js";
import { AutoRosterCandidateService } from "./AutoRosterCandidateService.js";
import { BudgetedAutoRosterSelector } from "./BudgetedAutoRosterSelector.js";
import { RosterPricingCoordinator } from "./RosterPricingCoordinator.js";
import { ApplicationDataRevision } from "./ApplicationDataRevision.js";
import { HeavyTaskCoordinator } from "./HeavyTaskCoordinator.js";

export class AutoRosterSubmissionService {
  constructor(options) { Object.assign(this, options); this.candidates = options.candidates || new AutoRosterCandidateService(options); this.policy = new AutoRosterTourPolicy(); }
  async fillRoster(userId, tourId = "next") {
    const user = await this.userRepository.findUserById(userId);
    if (user?.status !== "active") return { type: "registration" };
    const calendar = await this.calendarRepository.listCalendar(); const tour = this.policy.findOpenTour(calendar, tourId);
    if (!tour) return { type: "closed" };
    const roster = await this.rosterRepository.findRosterByUserAndMonth(userId, tour.month);
    if (this.policy.isRosterSaved(roster)) return { type: "existing", tour, roster };
    const candidates = await (this.heavy || HeavyTaskCoordinator.getShared()).runTask(() => this.candidates.loadCandidates(calendar, tour));
    return new RosterPricingCoordinator().runExclusive(async () => {
      if ((await this.userRepository.findUserById(userId))?.status !== "active") return { type: "registration" };
      const latestCalendar = await this.calendarRepository.listCalendar(); const latestTour = this.policy.findOpenTour(latestCalendar, tour.id);
      if (!latestTour) return { type: "closed" };
      const current = await this.rosterRepository.findRosterByUserAndMonth(userId, tour.month);
      if (this.policy.isRosterSaved(current)) return { type: "existing", tour: latestTour, roster: current };
      const scores = new Map(candidates.map((player) => [player.id, player.autoScore]));
      const eligible = this.policy.findEligiblePlayers(await this.playerCatalogRepository.listPlayers(), latestCalendar, latestTour)
        .map((player) => ({ ...player, autoScore: scores.get(player.id) || 0 }));
      const players = new BudgetedAutoRosterSelector().selectPlayers(eligible);
      if (!players) return { type: "unavailable", tour: latestTour };
      const finalTour = this.policy.findOpenTour(await this.calendarRepository.listCalendar(), tour.id);
      if (!finalTour || finalTour.month !== tour.month) return { type: "closed" };
      const slots = players.map((player, slotIndex) => ({ slotIndex, position: player.position, playerId: player.id, lockedPrice: player.price }));
      const saved = await this.rosterRepository.saveRosterBeforeDeadline(userId, tour.month, slots, finalTour.deadlineTime);
      if (!saved) return { type: "closed" };
      await new ApplicationDataRevision().invalidateReports();
      return { type: "saved", tour: finalTour, roster: saved, players };
    });
  }
}
