import { RuntimeStateStore } from "./RuntimeStateStore.js";

export class WorkerHeartbeat {
  constructor(store = new RuntimeStateStore(), fileName = "vhl-heartbeat.json") { Object.assign(this, { store, fileName }); }
  async recordCycle(task) {
    const previous = await this.store.readState(this.fileName);
    await this.store.writeState(this.fileName, { ...previous, processing: true, startedAt: Date.now(), pid: process.pid });
    try {
      const results = await task();
      const failures = results.filter((result) => result.ok === false);
      await this.store.writeState(this.fileName, { processing: false, completedAt: Date.now(), pid: process.pid,
        failedMatches: failures.length, checkedMatches: results.length,
        consecutiveFailedCycles: failures.length ? Number(previous?.consecutiveFailedCycles || 0) + 1 : 0,
        lastFailures: failures.slice(0, 3).map(({ matchId, reason }) => ({ matchId, reason })) });
      return results;
    } catch (error) {
      await this.store.writeState(this.fileName, { ...previous, processing: false, failedAt: Date.now(), error: error.message, pid: process.pid,
        consecutiveFailedCycles: Number(previous?.consecutiveFailedCycles || 0) + 1 });
      throw error;
    }
  }
}
