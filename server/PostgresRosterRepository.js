import { PostgresJsonPayloadMapper } from "./PostgresJsonPayloadMapper.js";

export class PostgresRosterRepository {
  constructor(database, mapper = new PostgresJsonPayloadMapper()) { Object.assign(this, { database, mapper }); }

  async saveRoster(userId, month, slots) {
    const roster = { userId: String(userId), month, status: "confirmed", slots, updated_at: new Date().toISOString() };
    await this.database.query(`insert into rosters (user_id, month, payload) values ($1,$2,$3::jsonb)
      on conflict (user_id, month) do update set payload=excluded.payload`, [roster.userId, month, this.mapper.toJson(roster)]);
    return roster;
  }

  async findRosterByUserAndMonth(userId, month) {
    const result = await this.database.query("select payload from rosters where user_id=$1 and month=$2", [String(userId), month]);
    return result.rows[0] ? this.mapper.toPayload(result.rows[0]) : null;
  }

  async listRosters() {
    const result = await this.database.query("select payload from rosters order by month, user_id");
    return this.mapper.toPayloads(result.rows);
  }

  async listRostersByMonth(month) {
    const result = await this.database.query("select payload from rosters where month=$1 order by user_id", [month]);
    return this.mapper.toPayloads(result.rows);
  }
}
