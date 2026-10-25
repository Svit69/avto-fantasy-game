import { RosterCompletionPolicy } from "./RosterCompletionPolicy.js";
import { DraftDeadlineJobFactory } from "./DraftDeadlineJobFactory.js";
import { DraftNotificationTimePolicy } from "./DraftNotificationTimePolicy.js";

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
    if (!new DraftNotificationTimePolicy().isInsideReminderWindow(tour.deadlineAt, stage.hours, now, this.windowMs)) return;
    const rosters = new Map((await this.rosterRepository.listRostersByMonth(tour.month)).map((roster) => [String(roster.userId), roster]));
    for (const user of users) {
      const roster = rosters.get(String(user.id));
      const confirmed = this.rosterPolicy.isRosterConfirmed(roster);
      if (stage.hours === 24 && confirmed) continue;
      jobs.push(this.#createDeadlineJob(user, tour, stage.hours, confirmed));
    }
  }

  #createDeadlineJob(user, tour, hours, confirmed) {
    return new DraftDeadlineJobFactory(this.messageFactory).createJob(user, tour, hours, confirmed);
  }

  #createTourOpenedJobs(tours, users, now) {
    const sortedTours = this.#sortTours(tours);
    return sortedTours.filter((tour) => new DraftNotificationTimePolicy().isRecentlyReached(tour.deadlineAt, now, this.windowMs))
      .flatMap((tour) => users.map((user) => ({
        userId: user.id, key: `tour-opened:${tour.id}`,
        text: this.messageFactory.createTourOpenedMessage(tour, sortedTours[sortedTours.indexOf(tour) + 1]),
      })));
  }

  #activeUsers(users) { return users.filter((user) => user.status !== "blocked"); }
  #sortTours(tours) { return [...tours].sort((a, b) => Date.parse(a.deadlineAt) - Date.parse(b.deadlineAt)); }
}
