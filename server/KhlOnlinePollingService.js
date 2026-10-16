import { RuntimeStateStore } from "./RuntimeStateStore.js";
import { KhlOnlineMatchSelector } from "./KhlOnlineMatchSelector.js";
import { NotificationWorkerLock } from "./NotificationWorkerLock.js";

export class KhlOnlinePollingService {
  constructor({ calendarRepository, collector, notifier, logger, store = new RuntimeStateStore(), selector = new KhlOnlineMatchSelector(), intervalMs = 300000 }) {
    Object.assign(this, { calendarRepository, collector, notifier, logger, store, selector, intervalMs });
    this.lock = new NotificationWorkerLock(store.resolveFile("khl-online-worker"), 600000);
  }
  async pollActiveMatches() {
    if (!await this.lock.acquireLock()) return [];
    try {
      const calendar = await this.calendarRepository.listCalendar();
      const states = await this.store.readState("khl-online-matches.json") || {};
      const matches = this.selector.findDueMatches(calendar, states);
      const results = [];
      for (const match of matches) {
        const now = Date.now(); const previous = states[match.id] || {};
        let result;
        try { result = await this.collector.collectMatch(match, previous, now); }
        catch (error) {
          const failures = Number(previous.failures || 0) + 1;
          result = { ok: false, reason: error.message, state: { ...previous, failures, lastError: error.message } };
          this.logger.warn("khl_online_match_failed", { matchId: match.id, errorMessage: error.message, failures });
          if (failures >= 3) {
            try { await this.notifier?.notifyOnce(match, "error", null, [], `${error.message}\nПрежние данные сохранены. Повторим запрос позже.`); }
            catch (notificationError) { this.logger.warn("khl_online_notification_failed", { errorMessage: notificationError.message }); }
          }
        }
        states[match.id] = { ...result.state, checkedAt: Date.now(), nextPollAt: Date.now() + this.intervalMs };
        await this.store.writeState("khl-online-matches.json", states);
        results.push({ ...result, state: undefined, matchId: match.id });
      }
      this.logger.info("khl_online_poll_finished", { matches: results.length, failures: results.filter((result) => !result.ok).length });
      return results;
    } finally { await this.lock.releaseLock(); }
  }
}
