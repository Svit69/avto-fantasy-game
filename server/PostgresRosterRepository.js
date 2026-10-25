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
  async saveRosterBeforeDeadline(userId, month, slots, deadlineTime) {
    const roster = { userId: String(userId), month, status: "confirmed", slots, updated_at: new Date().toISOString() };
    const result = await this.database.query(`insert into rosters (user_id, month, payload) select $1,$2,$3::jsonb where clock_timestamp() < $4::timestamptz
      on conflict (user_id, month) do update set payload=excluded.payload where clock_timestamp() < $4::timestamptz returning payload`,
    [String(userId), month, this.mapper.toJson(roster), new Date(deadlineTime).toISOString()]);
    return result.rows[0] ? this.mapper.toPayload(result.rows[0]) : null;
  }

  async listRosters() {
    const result = await this.database.query("select payload from rosters order by month, user_id");
    return this.mapper.toPayloads(result.rows);
  }

  async replaceRosterIfUnchanged(expected, next, deadlineTime) {
    return (await this.replaceRostersIfUnchanged([{ expected, next }], deadlineTime))[0] || null;
  }
  async replaceRostersIfUnchanged(changes, deadlineTime) {
    if (!changes.length) return [];
    const updates = changes.map(({ expected, next }) => ({ user_id: String(expected.userId), month: expected.month, expected, replacement: next }));
    const result = await this.database.query(`update rosters r set payload=c.replacement
      from jsonb_to_recordset($1::jsonb) as c(user_id text, month text, expected jsonb, replacement jsonb)
      where r.user_id=c.user_id and r.month=c.month and r.payload=c.expected and clock_timestamp() < $2::timestamptz returning r.payload`,
    [JSON.stringify(updates), new Date(deadlineTime).toISOString()]);
    return this.mapper.toPayloads(result.rows);
  }

  async listRostersByMonth(month) {
    const result = await this.database.query("select payload from rosters where month=$1 order by user_id", [month]);
    return this.mapper.toPayloads(result.rows);
  }
}
