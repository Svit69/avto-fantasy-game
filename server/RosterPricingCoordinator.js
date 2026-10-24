import { AsyncLocalStorage } from "node:async_hooks";
import fs from "node:fs/promises";
import path from "node:path";
import lockfile from "proper-lockfile";
import { RuntimeStateStore } from "./RuntimeStateStore.js";

export class RosterPricingCoordinator {
  static #scope = new AsyncLocalStorage();
  constructor(directory = new RuntimeStateStore().directory) { this.filePath = path.join(directory, "roster-pricing"); }
  async runExclusive(task) {
    if (RosterPricingCoordinator.#scope.getStore() === this.filePath) return task();
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    let release;
    try { release = await lockfile.lock(this.filePath, { realpath: false, retries: { retries: 150, minTimeout: 20, maxTimeout: 200 }, stale: 60000 }); }
    catch (error) { if (error.code === "ELOCKED") throw Object.assign(new Error("roster_prices_updating"), { statusCode: 503, retryAfter: 5 }); throw error; }
    try { return await RosterPricingCoordinator.#scope.run(this.filePath, task); }
    finally { await release(); }
  }
}
