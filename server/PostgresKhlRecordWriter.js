import { PostgresRequiredFieldValidator } from "./PostgresRequiredFieldValidator.js";

export class PostgresKhlRecordWriter {
  constructor(mapper, validator = new PostgresRequiredFieldValidator()) {
    Object.assign(this, { mapper, validator });
  }

  upsertSingle(client, table, id, payload) {
    return client.query(
      `insert into ${table} (id,payload) values ($1,$2::jsonb) on conflict (id) do update set payload=excluded.payload`,
      [String(id), this.mapper.toJson(payload)],
    );
  }

  upsertMatchItem(client, table, id, matchId, payload) {
    this.validator.assertRequiredValue(`${table}.id`, id);
    this.validator.assertRequiredValue(`${table}.match_id`, matchId);
    return client.query(
      `insert into ${table} (id,match_id,payload) values ($1,$2,$3::jsonb)
      on conflict (id) do update set match_id=excluded.match_id,payload=excluded.payload`,
      [String(id), matchId, this.mapper.toJson(payload)],
    );
  }

  upsertPlayerStat(client, payload) {
    this.validator.assertRequiredValue("khl_player_stats.match_id", payload.matchId);
    this.validator.assertRequiredValue("khl_player_stats.player_id", payload.playerId);
    return client.query(
      `insert into khl_player_stats (match_id,player_id,payload) values ($1,$2,$3::jsonb)
      on conflict (match_id,player_id) do update set payload=excluded.payload`,
      [payload.matchId, payload.playerId, this.mapper.toJson(payload)],
    );
  }
}
