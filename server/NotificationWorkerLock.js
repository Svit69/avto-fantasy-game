import fs from "node:fs/promises";
import path from "node:path";
import lockfile from "proper-lockfile";

export class NotificationWorkerLock {
  constructor(filePath, ttlMs = 15 * 60 * 1000) { Object.assign(this, { filePath, ttlMs, release: null }); }

  async acquireLock() {
    if (this.release) return false;
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    try {
      this.release = await lockfile.lock(this.filePath, { realpath: false, stale: Math.max(60000, this.ttlMs), update: 10000, retries: 0 });
      return true;
    } catch (error) {
      if (error.code === "ELOCKED") return false;
      throw error;
    }
  }

  async releaseLock() {
    if (!this.release) return;
    const release = this.release; this.release = null; await release();
  }
}
