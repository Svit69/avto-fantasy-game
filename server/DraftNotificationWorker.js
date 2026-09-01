export class DraftNotificationWorker {
  constructor({ userRepository, calendarRepository, planner, dispatcher, logger }) {
    Object.assign(this, { userRepository, calendarRepository, planner, dispatcher, logger });
  }

  async processDueNotifications(now = Date.now()) {
    const [users, calendar] = await Promise.all([this.userRepository.listUsers(), this.calendarRepository.listCalendar()]);
    const jobs = await this.planner.createNotificationJobs(calendar, users, now);
    const metrics = await this.dispatcher.dispatchNotificationJobs(jobs);
    this.logger.info("draft_notification_worker_finished", metrics);
    return metrics;
  }
}
