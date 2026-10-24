import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import lockfile from "proper-lockfile";

export class RosterJsonStore {
  constructor(filePath) { this.filePath = filePath; }
  async readRosters() {
    try {
      const data = JSON.parse(await fs.readFile(this.filePath, "utf8"));
      if (!Array.isArray(data.rosters)) throw new Error("invalid_roster_database");
      return data.rosters;
    } catch (error) { if (error.code === "ENOENT") return []; throw error; }
  }
  async mutateRosters(mutate, deadlineTime = Infinity) {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    const release = await lockfile.lock(this.filePath, { realpath: false, retries: { retries: 100, minTimeout: 10, maxTimeout: 100 }, stale: 60000 });
    const temporary = `${this.filePath}.${crypto.randomUUID()}.tmp`;
    try {
      const rosters = await this.readRosters(); const result = mutate(rosters);
      if (result === null) return null;
      await fs.writeFile(temporary, JSON.stringify({ rosters }, null, 2), "utf8");
      if (Date.now() >= deadlineTime) return null;
      await fs.rename(temporary, this.filePath); return result;
    } finally { try { await fs.rm(temporary, { force: true }); } finally { await release(); } }
  }
}
