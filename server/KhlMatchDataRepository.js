import fs from "node:fs/promises";
import path from "node:path";

export class KhlMatchDataRepository {
  constructor(filePath) { this.filePath = filePath; }

  async readDatabase() {
    try { return this.#normalizeDatabase(JSON.parse(await fs.readFile(this.filePath, "utf8"))); } catch { return this.#normalizeDatabase({}); }
  }

  async saveDatabase(database) {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(this.#normalizeDatabase(database), null, 2), "utf8");
  }

  async upsertMatch(match) {
    const database = await this.readDatabase();
    const index = database.matches.findIndex((stored) => stored.id === match.id);
    index >= 0 ? database.matches.splice(index, 1, { ...database.matches[index], ...match }) : database.matches.push(match);
    await this.saveDatabase(database);
    return match;
  }

  async replaceMatchCollections(matchId, collections) {
    const database = await this.readDatabase();
    Object.assign(database, {
      events: this.#replaceByMatch(database.events, collections.events, matchId),
      pointEntries: this.#replaceByMatch(database.pointEntries, collections.pointEntries, matchId),
      playerStats: this.#replaceByMatch(database.playerStats, collections.playerStats, matchId),
    });
    await this.saveDatabase(database);
  }

  async findMatchByGameId(gameId) { return (await this.readDatabase()).matches.find((match) => String(match.gameId) === String(gameId)) || null; }
  async listEventsByGameId(gameId) { return this.#findMatchChildren(gameId, "events"); }
  async listStatsByGameId(gameId) { return this.#findMatchChildren(gameId, "playerStats"); }
  async listPointEntriesByGameId(gameId) { return this.#findMatchChildren(gameId, "pointEntries"); }

  async #findMatchChildren(gameId, key) {
    const database = await this.readDatabase(); const match = database.matches.find((item) => String(item.gameId) === String(gameId));
    return match ? database[key].filter((item) => item.matchId === match.id) : [];
  }

  #replaceByMatch(currentItems, nextItems, matchId) {
    return [...currentItems.filter((item) => item.matchId !== matchId), ...nextItems];
  }

  #normalizeDatabase(database) {
    return { matches: database.matches || [], events: database.events || [], pointEntries: database.pointEntries || [], playerStats: database.playerStats || [], runs: database.runs || [], snapshots: database.snapshots || [] };
  }
}
