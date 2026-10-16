import path from "node:path";
import { NotificationWorkerLock } from "./NotificationWorkerLock.js";
import { ServerNotificationFactory } from "./ServerNotificationFactory.js";
export class PlayerVideoNotificationScheduler {
  #running = false;
  #stopped = true;
  constructor({ rootDirectory, botClient, logger, lock, createWorker }) {
    Object.assign(this, { botClient, logger, lock: lock || new NotificationWorkerLock(path.join(rootDirectory, process.env.NOTIFICATION_LOCK_PATH || "storage/notification-worker.lock")),
      createWorker: createWorker || (() => new ServerNotificationFactory(rootDirectory, botClient, logger).createPlayerVideoNotificationWorker()) });
  }
  start() {
    if (!this.#stopped || process.env.PLAYER_VIDEO_NOTIFICATIONS_ENABLED === "false" || !this.botClient.hasToken()) return;
    this.#stopped = false;
    this.logger.info("player_video_scheduler_started", { intervalMs: 60000 });
    const tick = async () => {
      try { await this.runOnce(); } catch (error) { this.logger.warn("player_video_scheduler_failed", { errorMessage: error.message }); }
      if (!this.#stopped) { this.timer = setTimeout(tick, 60000); this.timer.unref(); }
    };
    this.timer = setTimeout(tick, 1000); this.timer.unref();
  }
  stop() { this.#stopped = true; clearTimeout(this.timer); }
  async runOnce() {
    if (this.#running) return { skipped: true };
    this.#running = true;
    let acquired = false;
    try {
      acquired = await this.lock.acquireLock();
      if (!acquired) return { skipped: true };
      return await this.createWorker().processDueNotifications();
    } finally { try { if (acquired) await this.lock.releaseLock(); } finally { this.#running = false; } }
  }
}
