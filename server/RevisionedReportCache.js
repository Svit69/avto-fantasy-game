import { ApplicationDataRevision } from "./ApplicationDataRevision.js";

export class RevisionedReportCache {
  #entries = new Map();
  constructor({ revision = new ApplicationDataRevision(), ttlMs = 15000, maximum = 6, clock = Date.now } = {}) {
    Object.assign(this, { revision, ttlMs, maximum, clock });
  }
  async loadReport(key, loader) {
    const revision = await this.revision.readRevision();
    const current = this.#entries.get(key);
    if (current?.revision === revision && (current.pending || current.expiresAt > this.clock())) return current.pending || current.value;
    if (!this.#entries.has(key) && this.#entries.size >= this.maximum) this.#entries.delete(this.#entries.keys().next().value);
    const entry = { revision };
    this.#entries.set(key, entry);
    entry.pending = Promise.resolve().then(loader).then((value) => {
      Object.assign(entry, { value, expiresAt: this.clock() + this.ttlMs, pending: null });
      return value;
    }).catch((error) => { if (this.#entries.get(key) === entry) this.#entries.delete(key); throw error; });
    return entry.pending;
  }
}
