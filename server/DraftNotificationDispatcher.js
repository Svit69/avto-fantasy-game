export class DraftNotificationDispatcher {
  constructor(botClient, sentRepository, logger, rateLimiter, batchSize = 500) {
    Object.assign(this, { botClient, sentRepository, logger, rateLimiter, batchSize });
  }

  async dispatchNotificationJobs(jobs) {
    const metrics = { planned: jobs.length, skipped: 0, attempted: 0, sent: 0, failed: 0, limited: 0 };
    for (const job of jobs) await this.#dispatchWithinBatch(job, metrics);
    return metrics;
  }

  async #dispatchWithinBatch(job, metrics) {
    if (metrics.attempted >= this.batchSize) { metrics.limited += 1; return; }
    if (await this.sentRepository.hasNotificationBeenSent(job.userId, job.key)) { metrics.skipped += 1; return; }
    metrics.attempted += 1;
    await this.rateLimiter.waitForNextDeliverySlot();
    if (await this.#dispatchNotificationJob(job)) metrics.sent += 1; else metrics.failed += 1;
  }

  async #dispatchNotificationJob(job) {
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
