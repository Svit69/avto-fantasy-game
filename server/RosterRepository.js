import fs from "node:fs/promises";
import path from "node:path";

export class RosterRepository {
  constructor(filePath) {
    this.filePath = filePath;
  }

  async saveRoster(userId, slots) {
    const rosters = await this.#readRosters();
    const nextRoster = { userId: String(userId), slots, updated_at: new Date().toISOString() };
    const nextRosters = rosters.filter((roster) => roster.userId !== nextRoster.userId);
    nextRosters.push(nextRoster);
    await this.#writeRosters(nextRosters);
    return nextRoster;
  }

  async findRosterByUserId(userId) {
    return (await this.#readRosters()).find((roster) => roster.userId === String(userId)) || null;
  }

  async #readRosters() {
    try {
      const payload = JSON.parse(await fs.readFile(this.filePath, "utf8"));
      return Array.isArray(payload.rosters) ? payload.rosters : [];
    } catch {
      return [];
    }
  }

  async #writeRosters(rosters) {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify({ rosters }, null, 2), "utf8");
  }
}
