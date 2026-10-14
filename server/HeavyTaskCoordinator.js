import fs from "node:fs/promises";
import lockfile from "proper-lockfile";
import { BoundedTaskQueue } from "./BoundedTaskQueue.js";
import { RuntimeStateStore } from "./RuntimeStateStore.js";
import { ServiceCapacityError } from "./ServiceCapacityError.js";
import { OperationalSettings as Settings } from "./OperationalSettings.js";

export class HeavyTaskCoordinator {
  static #instance;
  static getShared() { return this.#instance ||= new HeavyTaskCoordinator(); }
  constructor(store = new RuntimeStateStore(), queue = new BoundedTaskQueue(1, Settings.readNumber("HEAVY_TASK_QUEUE_SIZE", 4, 0, 20))) { Object.assign(this, { store, queue }); }
  runTask(task) {
    return this.queue.runTask(async () => {
      await fs.mkdir(this.store.directory, { recursive: true });
      let release;
      try { release = await lockfile.lock(this.store.resolveFile("heavy-task"), { realpath: false, stale: 600000, update: 10000,
        retries: { retries: 10, minTimeout: 100, maxTimeout: 1000 } }); }
      catch (error) { if (error.code === "ELOCKED") throw new ServiceCapacityError("heavy_task_busy"); throw error; }
      try { return await task(); } finally { await release(); }
    });
  }
}
