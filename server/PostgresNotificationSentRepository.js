export class PostgresNotificationSentRepository {
  constructor(database) { this.database = database; }

  async hasNotificationBeenSent(userId, notificationKey) {
    const result = await this.database.query("select 1 from notifications_sent where user_id=$1 and key=$2", [String(userId), notificationKey]);
    return Boolean(result.rows[0]);
  }

  async markNotificationAsSent(userId, notificationKey) {
    await this.database.query(`insert into notifications_sent (user_id, key, payload) values ($1,$2,$3::jsonb)
      on conflict (user_id, key) do nothing`, [String(userId), notificationKey, JSON.stringify({ sentAt: new Date().toISOString() })]);
  }
}
