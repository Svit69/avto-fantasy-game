import { PostgresJsonPayloadMapper } from "./PostgresJsonPayloadMapper.js";

export class PostgresSingleKeyJsonRepository {
  constructor(database, tableName, keyColumn = "id", mapper = new PostgresJsonPayloadMapper()) {
    Object.assign(this, { database, tableName, keyColumn, mapper });
  }

  async listRecords() {
    const result = await this.database.query(`select payload from ${this.tableName} order by ${this.keyColumn}`);
    return this.mapper.toPayloads(result.rows);
  }

  async findRecord(id) {
    const result = await this.database.query(`select payload from ${this.tableName} where ${this.keyColumn}=$1`, [String(id)]);
    return result.rows[0] ? this.mapper.toPayload(result.rows[0]) : null;
  }

  async upsertRecord(id, payload) {
    await this.database.query(`insert into ${this.tableName} (${this.keyColumn}, payload) values ($1,$2::jsonb)
      on conflict (${this.keyColumn}) do update set payload=excluded.payload`, [String(id), this.mapper.toJson(payload)]);
    return payload;
  }
}
