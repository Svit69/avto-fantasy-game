import { HeavyTaskCoordinator } from "./HeavyTaskCoordinator.js";
import { ApplicationDataRevision } from "./ApplicationDataRevision.js";
import { OperationalSettings as Settings } from "./OperationalSettings.js";

export class CachedPriceReviewService {
  #cached;
  #pending;
  constructor(service, { coordinator = HeavyTaskCoordinator.getShared(), revision = new ApplicationDataRevision(), ttlMs = Settings.readNumber("PRICE_REVIEW_CACHE_MS", 90000), clock = Date.now } = {}) {
    Object.assign(this, { service, coordinator, revision, ttlMs, clock });
  }
  async createReviewReport(force = false) {
    const revision = await this.revision.readRevision();
    if (!force && this.#cached?.revision === revision && this.#cached.expiresAt > this.clock()) return this.#cached.report;
    if (this.#pending) return this.#pending;
    const pending = this.coordinator.runTask(async () => {
      const report = await this.service.createReviewReport();
      this.#cached = { report, revision, expiresAt: this.clock() + this.ttlMs };
      return report;
    });
    this.#pending = pending;
    try { return await pending; } finally { if (this.#pending === pending) this.#pending = null; }
  }
}
