import { RosterCompletionPolicy } from "./RosterCompletionPolicy.js";

export class DraftNotificationPlanner {
  constructor(rosterRepository, messageFactory, windowMs = 65 * 60 * 1000) {
    Object.assign(this, { rosterRepository, messageFactory, windowMs, rosterPolicy: new RosterCompletionPolicy() });
  }

  async createNotificationJobs(calendar, users, now = Date.now()) {
    const jobs = await this.#createDeadlineJobs(calendar.tours, this.#activeUsers(users), now);
    return [...jobs, ...this.#createTourOpenedJobs(calendar.tours, this.#activeUsers(users), now)];
  }

  async #createDeadlineJobs(tours, users, now) {
    const jobs = [];
    for (const tour of tours) for (const stage of [{ hours: 24 }, { hours: 1 }]) await this.#appendDeadlineJobs(jobs, users, tour, stage, now);
    return jobs;
  }

  async #appendDeadlineJobs(jobs, users, tour, stage, now) {
    if (!this.#isInsideReminderWindow(tour.deadlineAt, stage.hours, now)) return;
    for (const user of users) {
      const roster = await this.rosterRepository.findRosterByUserAndMonth(user.id, tour.month);
      const confirmed = this.rosterPolicy.isRosterConfirmed(roster);
      if (stage.hours === 24 && confirmed) continue;
      jobs.push(this.#createDeadlineJob(user, tour, stage.hours, confirmed));
    }
  }

  #createDeadlineJob(user, tour, hours, confirmed) {
    const type = confirmed ? "confirmed" : "missing";
    const text = confirmed ? this.messageFactory.createConfirmedRosterDeadlineMessage(tour)
      : this.messageFactory.createMissingRosterDeadlineMessage(tour, hours);
    return { userId: user.id, key: `deadline:${tour.id}:${hours}:${type}`, text };
  }

  #createTourOpenedJobs(tours, users, now) {
    const sortedTours = this.#sortTours(tours);
    return sortedTours.filter((tour) => this.#isRecentlyReached(tour.deadlineAt, now))
      .flatMap((tour) => users.map((user) => ({
        userId: user.id, key: `tour-opened:${tour.id}`,
        text: this.messageFactory.createTourOpenedMessage(tour, sortedTours[sortedTours.indexOf(tour) + 1]),
      })));
  }

  #isInsideReminderWindow(deadlineAt, hours, now) {
    const deadline = Date.parse(deadlineAt);
    const target = Date.parse(deadlineAt) - hours * 60 * 60 * 1000;
    return Number.isFinite(target) && now <= deadline && target <= now && now - target <= this.windowMs;
  }

  #isRecentlyReached(deadlineAt, now) {
    const deadline = Date.parse(deadlineAt);
    return Number.isFinite(deadline) && deadline <= now && now - deadline <= this.windowMs;
  }

  #activeUsers(users) { return users.filter((user) => user.status !== "blocked"); }
  #sortTours(tours) { return [...tours].sort((a, b) => Date.parse(a.deadlineAt) - Date.parse(b.deadlineAt)); }
}
