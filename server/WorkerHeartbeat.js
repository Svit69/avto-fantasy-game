import { RuntimeStateStore } from "./RuntimeStateStore.js";

export class WorkerHeartbeat {
  constructor(store = new RuntimeStateStore()) { this.store = store; }
  async recordCycle(task) {
    const previous = await this.store.readState("vhl-heartbeat.json");
    await this.store.writeState("vhl-heartbeat.json", { ...previous, processing: true, startedAt: Date.now(), pid: process.pid });
    try {
      const results = await task();
      const failures = results.filter((result) => result.ok === false);
      await this.store.writeState("vhl-heartbeat.json", { processing: false, completedAt: Date.now(), pid: process.pid,
        failedMatches: failures.length, checkedMatches: results.length,
        consecutiveFailedCycles: failures.length ? Number(previous?.consecutiveFailedCycles || 0) + 1 : 0,
        lastFailures: failures.slice(0, 3).map(({ matchId, reason }) => ({ matchId, reason })) });
      return results;
    } catch (error) {
      await this.store.writeState("vhl-heartbeat.json", { ...previous, processing: false, failedAt: Date.now(), error: error.message, pid: process.pid,
        consecutiveFailedCycles: Number(previous?.consecutiveFailedCycles || 0) + 1 });
      throw error;
    }
  }
}
