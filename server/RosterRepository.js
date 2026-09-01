import fs from "node:fs/promises";
import path from "node:path";

export class RosterRepository {
  constructor(filePath) {
    this.filePath = filePath;
  }

  async saveRoster(userId, month, slots) {
    const rosters = await this.#readRosters();
    const nextRoster = { userId: String(userId), month, status: "confirmed", slots, updated_at: new Date().toISOString() };
    const nextRosters = rosters.filter((roster) => !this.#isSameRosterScope(roster, nextRoster));
    nextRosters.push(nextRoster);
    await this.#writeRosters(nextRosters);
    return nextRoster;
  }

  async findRosterByUserAndMonth(userId, month) {
    const rosters = await this.#readRosters();
    return rosters.find((roster) => roster.userId === String(userId) && roster.month === month) || null;
  }

  async listRosters() { return this.#readRosters(); }

  #isSameRosterScope(roster, nextRoster) { return roster.userId === nextRoster.userId && roster.month === nextRoster.month; }

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
