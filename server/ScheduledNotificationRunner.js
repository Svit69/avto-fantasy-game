export class ScheduledNotificationRunner {
  #running = false;
  #stopped = true;
  constructor({ botClient, logger, lock, createWorker, isEnabled = () => true, eventPrefix }) {
    Object.assign(this, { botClient, logger, lock, createWorker, isEnabled, eventPrefix });
  }
  start() {
    if (!this.#stopped || !this.isEnabled() || !this.botClient.hasToken()) return;
    this.#stopped = false;
    this.logger.info(`${this.eventPrefix}_started`, { intervalMs: 60000 });
    const tick = async () => {
      try { await this.runOnce(); } catch (error) { this.logger.warn(`${this.eventPrefix}_failed`, { errorMessage: error.message }); }
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
