import crypto from "node:crypto";
import { RuntimeStateStore } from "./RuntimeStateStore.js";

export class ApplicationDataRevision {
  static #localRevision = "initial";
  constructor(store = new RuntimeStateStore()) { this.store = store; }
  async readRevision() {
    try { return `${(await this.store.readState("data-revision.json"))?.revision || "initial"}:${ApplicationDataRevision.#localRevision}`; }
    catch (error) { console.warn("report_cache_revision_unavailable", error.code || error.name); return ApplicationDataRevision.#localRevision; }
  }
  async invalidateReports() {
    const revision = crypto.randomUUID(); ApplicationDataRevision.#localRevision = revision;
    try { await this.store.writeState("data-revision.json", { revision }); return true; }
    catch (error) { console.warn("report_cache_invalidation_failed", error.code || error.name); return false; }
  }
}
