export class TourAvailabilityNotificationPlanner {
  constructor({ messageFactory, appUrlFactory, appUrl, windowMs, advanceDays = 7 }) {
    Object.assign(this, { messageFactory, appUrlFactory, appUrl, windowMs, advanceDays });
  }

  async createNotificationJobs(calendar, users, now = Date.now()) {
    return calendar.tours.filter((tour) => this.#isNotificationDue(tour, now))
      .flatMap((tour) => this.#createTourJobs(tour, users));
  }

  #createTourJobs(tour, users) {
    return users.filter((user) => user.status !== "blocked").map((user) => ({
      userId: user.id,
      key: `tour-available:${tour.id}`,
      text: this.messageFactory.createMessage(tour),
      replyMarkup: this.messageFactory.createApplicationButton(
        this.appUrlFactory.createAuthorizedAppUrl(this.appUrl, user),
      ),
    }));
  }

  #isNotificationDue(tour, now) {
    const deadline = Date.parse(tour.deadlineAt);
    const target = deadline - this.advanceDays * 24 * 60 * 60 * 1000;
    return Number.isFinite(target) && target <= now && now - target <= this.windowMs;
  }
}
