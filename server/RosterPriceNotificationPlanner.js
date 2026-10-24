import { TourSchedulePolicy } from "../src/services/TourSchedulePolicy.js";
import { FutureRosterPriceService } from "./FutureRosterPriceService.js";
import { RosterPriceNotificationMessageFactory } from "./RosterPriceNotificationMessageFactory.js";

export class RosterPriceNotificationPlanner {
  constructor(options) {
    Object.assign(this, options);
    this.reconciler = options.reconciler || new FutureRosterPriceService(options);
    this.messages = new RosterPriceNotificationMessageFactory();
  }
  async createNotificationJobs(calendar, users, now = Date.now()) {
    await this.reconciler.reconcileOpenRosters(calendar, now);
    const active = new Set(users.filter((user) => user.status !== "blocked").map((user) => String(user.id)));
    const tours = new TourSchedulePolicy().buildTourAccessStates(calendar, now).filter((tour) => tour.isOpen && !tour.isLocked && Number.isFinite(tour.deadlineTime));
    const jobs = [];
    for (const tour of tours) for (const roster of await this.rosterRepository.listRostersByMonth(tour.month)) {
      const adjustment = roster.priceAdjustment;
      if (!active.has(String(roster.userId)) || roster.status !== "editing" || !adjustment || adjustment.total <= adjustment.budget) continue;
      jobs.push({ userId: roster.userId, key: `roster-price:${tour.id}:${adjustment.id}`, verifyTelegramResult: true,
        isPending: () => this.#isPending(roster, tour),
        text: this.messages.createMessage(roster, tour), replyMarkup: this.messages.createApplicationButton(tour.month) });
    }
    return jobs;
  }
  async #isPending(roster, tour) {
    if (Date.now() >= tour.deadlineTime) return false;
    const current = await this.rosterRepository.findRosterByUserAndMonth(roster.userId, roster.month);
    return current?.status === "editing" && current.priceAdjustment?.id === roster.priceAdjustment.id;
  }
}
