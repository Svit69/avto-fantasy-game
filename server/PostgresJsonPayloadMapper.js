export class PostgresJsonPayloadMapper {
  toPayload(record) { return typeof record?.payload === "string" ? JSON.parse(record.payload) : record?.payload; }
  toPayloads(rows) { return rows.map((row) => this.toPayload(row)); }
  toJson(record) { return JSON.stringify(record || {}); }
}
