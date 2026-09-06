import fs from "node:fs/promises";

export class JsonStorageReader {
  constructor(resolveStoragePath) { this.resolveStoragePath = resolveStoragePath; }

  readUsers() { return this.#readArray("storage/users.json", "users"); }
  readPlayers() { return this.#readArray("storage/players.json", "players"); }
  readRosters() { return this.#readArray("storage/rosters.json", "rosters"); }
  readNotifications() { return this.#readArray("storage/notifications.json", "records"); }
  readOpponents() { return this.#readArray("storage/opponents.json", "teams"); }
  async readCalendar() { return { tours: await this.#readArray("storage/calendar.json", "tours"), matches: await this.#readArray("storage/calendar.json", "matches") }; }
  async readMatchData() { return JSON.parse(await this.#readText("storage/khl-match-data.json", "{}")); }

  async #readArray(filePath, key) {
    const payload = JSON.parse(await this.#readText(filePath, "{}"));
    return Array.isArray(payload[key]) ? payload[key] : [];
  }

  async #readText(filePath, fallback) {
    try { return await fs.readFile(this.resolveStoragePath(filePath), "utf8"); } catch { return fallback; }
  }
}
