import { KhlMatchDataJsonNormalizer } from "./KhlMatchDataJsonNormalizer.js";
import { PostgresKhlCollectionStore } from "./PostgresKhlCollectionStore.js";

export class PostgresKhlMatchDataRepository {
  constructor(database, normalizer = new KhlMatchDataJsonNormalizer()) {
    Object.assign(this, { normalizer, store: new PostgresKhlCollectionStore(database) });
  }

  async readDatabase() {
    const [matches, events, pointEntries, playerStats, runs, snapshots] = await Promise.all([
      this.store.list("khl_matches"), this.store.list("khl_events"), this.store.list("khl_point_entries"),
      this.store.list("khl_player_stats"), this.store.list("khl_runs"), this.store.list("khl_snapshots"),
    ]);
    return { matches, events, pointEntries, playerStats, runs, snapshots };
  }

  async listMatches() { return this.store.list("khl_matches"); }
  async listStatsByMatchIds(matchIds) { return this.store.listByMatchIds("khl_player_stats", matchIds.map(String)); }
  async saveDatabase(database) { await this.store.replaceDatabase(this.#normalize(database)); }
  async upsertMatch(match) { await this.store.upsertMatch(match); return match; }
  async replaceMatchCollections(matchId, collections) { await this.store.replaceMatchCollections(matchId, collections); }
  async findMatchByGameId(gameId) { return (await this.readDatabase()).matches.find((match) => String(match.gameId) === String(gameId)) || null; }
  async listEventsByGameId(gameId) { return this.#findChildren(gameId, "events"); }
  async listStatsByGameId(gameId) { return this.#findChildren(gameId, "playerStats"); }
  async listPointEntriesByGameId(gameId) { return this.#findChildren(gameId, "pointEntries"); }

  async #findChildren(gameId, key) {
    const database = await this.readDatabase(); const match = database.matches.find((item) => String(item.gameId) === String(gameId));
    return match ? database[key].filter((item) => item.matchId === match.id) : [];
  }

  #normalize(database) { return this.normalizer.normalizeDatabase(database); }
}
