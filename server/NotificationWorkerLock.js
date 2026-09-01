import fs from "node:fs/promises";
import path from "node:path";

export class NotificationWorkerLock {
  constructor(filePath, ttlMs = 15 * 60 * 1000) { Object.assign(this, { filePath, ttlMs, acquired: false }); }

  async acquireLock() {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await this.#removeStaleLock();
    try {
      await fs.writeFile(this.filePath, JSON.stringify({ pid: process.pid, createdAt: Date.now() }), { flag: "wx" });
      this.acquired = true; return true;
    } catch (error) {
      if (error.code === "EEXIST") return false;
      throw error;
    }
  }

  async releaseLock() {
    if (!this.acquired) return;
    await fs.unlink(this.filePath).catch(() => {});
    this.acquired = false;
  }

  async #removeStaleLock() {
    try {
      const payload = JSON.parse(await fs.readFile(this.filePath, "utf8"));
      if (Date.now() - Number(payload.createdAt || 0) > this.ttlMs) await fs.unlink(this.filePath);
    } catch {}
  }
}
