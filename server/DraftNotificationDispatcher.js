export class DraftNotificationDispatcher {
  constructor(botClient, sentRepository, logger) {
    Object.assign(this, { botClient, sentRepository, logger });
  }

  async dispatchNotificationJobs(jobs) {
    let sentCount = 0;
    for (const job of jobs) if (await this.#dispatchNotificationJob(job)) sentCount += 1;
    return sentCount;
  }

  async #dispatchNotificationJob(job) {
    if (await this.sentRepository.hasNotificationBeenSent(job.userId, job.key)) return false;
    try {
      const response = await this.botClient.callMethod("sendMessage", { chat_id: job.userId, text: job.text });
      if (!response.ok) return false;
      await this.sentRepository.markNotificationAsSent(job.userId, job.key);
      this.logger.info("draft_notification_sent", { userId: job.userId, key: job.key });
      return true;
    } catch (error) {
      this.logger.warn("draft_notification_failed", { userId: job.userId, key: job.key, errorMessage: error.message });
      return false;
    }
  }
}
