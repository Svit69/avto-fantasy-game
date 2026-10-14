import { RuntimeStateStore } from "./RuntimeStateStore.js";

export class WorkerHeartbeat {
  constructor(store = new RuntimeStateStore()) { this.store = store; }
  async recordCycle(task) {
    const previous = await this.store.readState("vhl-heartbeat.json");
    await this.store.writeState("vhl-heartbeat.json", { ...previous, processing: true, startedAt: Date.now(), pid: process.pid });
    try {
      const results = await task();
      await this.store.writeState("vhl-heartbeat.json", { processing: false, completedAt: Date.now(), pid: process.pid,
        failedMatches: results.filter((result) => result.ok === false).length, checkedMatches: results.length });
      return results;
    } catch (error) {
      await this.store.writeState("vhl-heartbeat.json", { ...previous, processing: false, failedAt: Date.now(), error: error.message, pid: process.pid });
      throw error;
    }
  }
}
