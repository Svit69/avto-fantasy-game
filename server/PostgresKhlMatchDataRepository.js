import { KhlMatchDataJsonNormalizer } from "./KhlMatchDataJsonNormalizer.js";
import { PostgresKhlCollectionStore } from "./PostgresKhlCollectionStore.js";
import { ImportedMatchGameSelector } from "./ImportedMatchGameSelector.js";
import { KhlMatchCollectionQuery } from "./KhlMatchCollectionQuery.js";

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
  async findMatchByGameId(gameId) { return new ImportedMatchGameSelector().selectMatchByGameId((await this.readDatabase()).matches, gameId); }
  async listEventsByGameId(gameId) { return new KhlMatchCollectionQuery(this).findMatchChildren(gameId, "events"); }
  async listStatsByGameId(gameId) { return new KhlMatchCollectionQuery(this).findMatchChildren(gameId, "playerStats"); }
  async listPointEntriesByGameId(gameId) { return new KhlMatchCollectionQuery(this).findMatchChildren(gameId, "pointEntries"); }

  #normalize(database) { return this.normalizer.normalizeDatabase(database); }
}
