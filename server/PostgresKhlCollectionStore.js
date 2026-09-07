import crypto from "node:crypto";
import { KHL_COLLECTION_TABLES } from "./PostgresKhlTableNames.js";
import { PostgresJsonPayloadMapper } from "./PostgresJsonPayloadMapper.js";
import { PostgresKhlRecordWriter } from "./PostgresKhlRecordWriter.js";

export class PostgresKhlCollectionStore {
  constructor(database, mapper = new PostgresJsonPayloadMapper()) {
    Object.assign(this, { database, mapper, writer: new PostgresKhlRecordWriter(mapper) });
  }

  async list(tableName) {
    const result = await this.database.query(`select payload from ${tableName}`);
    return this.mapper.toPayloads(result.rows);
  }

  async listByMatchIds(tableName, matchIds) {
    if (!matchIds.length) return [];
    const result = await this.database.query(`select payload from ${tableName} where match_id = any($1::text[])`, [matchIds]);
    return this.mapper.toPayloads(result.rows);
  }

  async replaceDatabase(database) {
    await this.database.transaction(async (client) => {
      for (const table of KHL_COLLECTION_TABLES) await client.query(`delete from ${table}`);
      await this.#insertAll(client, database);
    });
  }

  async upsertMatch(match) { await this.writer.upsertSingle(this.database, "khl_matches", match.id, match); }

  async replaceMatchCollections(matchId, collections) {
    await this.database.transaction(async (client) => {
      for (const table of ["khl_events", "khl_point_entries", "khl_player_stats"]) await client.query(`delete from ${table} where match_id=$1`, [matchId]);
      await this.#insertAll(client, { events: collections.events || [], pointEntries: collections.pointEntries || [], playerStats: collections.playerStats || [] });
    });
  }

  async #insertAll(client, database) {
    for (const match of database.matches || []) await this.writer.upsertSingle(client, "khl_matches", match.id, match);
    for (const item of database.events || []) await this.writer.upsertMatchItem(client, "khl_events", this.#resolveItemId(item), item.matchId, item);
    for (const item of database.pointEntries || []) await this.writer.upsertMatchItem(client, "khl_point_entries", this.#resolveItemId(item), item.matchId, item);
    for (const item of database.playerStats || []) await this.writer.upsertPlayerStat(client, item);
    for (const item of database.runs || []) await this.writer.upsertSingle(client, "khl_runs", item.id || crypto.randomUUID(), item);
    for (const item of database.snapshots || []) await this.writer.upsertSingle(client, "khl_snapshots", item.id || crypto.randomUUID(), item);
  }

  #resolveItemId(item) { return item.id || item.eventKey || item.sourceHash || `${item.matchId}:${crypto.randomUUID()}`; }
}
