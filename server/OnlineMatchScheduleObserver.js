import { OnlineMatchScheduleRepository } from "./OnlineMatchScheduleRepository.js";
import { RosterPricingCoordinator } from "./RosterPricingCoordinator.js";
import { ApplicationDataRevision } from "./ApplicationDataRevision.js";

export class OnlineMatchScheduleObserver {
  constructor({ repository = new OnlineMatchScheduleRepository(), notifier = null, logger = null, clock = Date.now } = {}) { Object.assign(this, { repository, notifier, logger, clock }); }
  async observeMatch(expected, observed) {
    const record = await new RosterPricingCoordinator().runExclusive(() => this.repository.recordObservation(expected, observed, this.clock()));
    if (record.changed) await new ApplicationDataRevision().invalidateReports();
    try {
      if (record.previousStartsAt !== record.scheduledAt) await this.notifier?.notifyOnce(expected, `schedule:${record.scheduledAt}`, { match: observed }, [],
        `Время матча изменилось. Было: ${this.#formatTime(record.previousStartsAt)}; стало: ${this.#formatTime(record.scheduledAt)}.\nДедлайн состава не позднее первого матча тура.`);
      if (record.startedAt !== null) await this.notifier?.notifyOnce(expected, "start", { match: observed });
    } catch (error) { this.logger?.warn("online_schedule_notification_failed", { errorMessage: error.message }); }
    return record;
  }
  #formatTime(value) { return new Intl.DateTimeFormat("ru-RU", { timeZone: "Europe/Moscow", dateStyle: "short", timeStyle: "short" }).format(new Date(value)) + " МСК"; }
}
