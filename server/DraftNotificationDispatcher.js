import { VideoNoteNotificationDelivery } from "./VideoNoteNotificationDelivery.js";
export class DraftNotificationDispatcher {
  constructor(botClient, sentRepository, logger, rateLimiter, batchSize = 500) {
    Object.assign(this, { botClient, sentRepository, logger, rateLimiter, batchSize });
    this.videoDelivery = new VideoNoteNotificationDelivery(botClient, logger);
  }

  async dispatchNotificationJobs(jobs) {
    const metrics = { planned: jobs.length, skipped: 0, attempted: 0, sent: 0, failed: 0, limited: 0 };
    for (const job of jobs) {
      try { await this.#dispatchWithinBatch(job, metrics); }
      catch (error) { metrics.failed += 1; this.logger.warn("draft_notification_failed", { userId: job.userId, key: job.key, errorMessage: error.message }); }
    }
    return metrics;
  }

  async #dispatchWithinBatch(job, metrics) {
    if (job.videoNote && !await this.videoDelivery.isDeliveryPending(job)) { metrics.skipped += 1; return; }
    if (metrics.attempted >= this.batchSize) { metrics.limited += 1; return; }
    if (await this.sentRepository.hasNotificationBeenSent(job.userId, job.key)) { metrics.skipped += 1; return; }
    metrics.attempted += 1;
    await this.rateLimiter.waitForNextDeliverySlot();
    if (job.isPending && !await job.isPending()) { metrics.skipped += 1; return; }
    if (job.videoNote) { metrics[await this.videoDelivery.deliver(job)] += 1; return; }
    if (await this.#dispatchNotificationJob(job)) metrics.sent += 1; else metrics.failed += 1;
  }

  async #dispatchNotificationJob(job) {
    try {
      const payload = { chat_id: job.userId, text: job.text };
      if (job.replyMarkup) payload.reply_markup = job.replyMarkup;
      if (job.parseMode) payload.parse_mode = job.parseMode;
      const response = await this.botClient.callMethod("sendMessage", payload);
      if (!response.ok) return false;
      if (job.verifyTelegramResult && !(await response.json()).ok) return false;
      await this.sentRepository.markNotificationAsSent(job.userId, job.key);
      this.logger.info("draft_notification_sent", { userId: job.userId, key: job.key });
      return true;
    } catch (error) {
      this.logger.warn("draft_notification_failed", { userId: job.userId, key: job.key, errorMessage: error.message });
      return false;
    }
  }
}
